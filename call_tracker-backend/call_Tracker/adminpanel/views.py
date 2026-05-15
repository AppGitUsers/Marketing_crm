from django.utils import timezone
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import status
from django.shortcuts import get_object_or_404

from employees.models import Employee
from calls.models import Call
from calls.serializers import CallSerializer
from .serializers import AdminEmployeeSerializer


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, "role", None) == "admin" or request.user.is_superuser)
        )


class AdminEmployeeListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        search = request.GET.get("search", "")

        employees = Employee.objects.select_related("user").order_by("-created_at")

        if search:
            employees = employees.filter(
                Q(employee_name__icontains=search) |
                Q(user__username__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(department__icontains=search) |
                Q(designation__icontains=search)
            )

        serializer = AdminEmployeeSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminEmployeeSerializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.save()
            data = AdminEmployeeSerializer(employee).data
            data["generated_password"] = getattr(employee, "generated_password", None)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminEmployeeDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_object(self, pk):
        return get_object_or_404(Employee.objects.select_related("user"), pk=pk)

    def get(self, request, pk):
        employee = self.get_object(pk)
        return Response(AdminEmployeeSerializer(employee).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        employee = self.get_object(pk)
        serializer = AdminEmployeeSerializer(employee, data=request.data)
        if serializer.is_valid():
            employee = serializer.save()
            return Response(AdminEmployeeSerializer(employee).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        employee = self.get_object(pk)
        employee.user.delete()
        return Response(
            {"message": "Employee deleted successfully"},
            status=status.HTTP_200_OK
        )


class AdminCallsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        search = request.GET.get("search", "")
        status_filter = request.GET.get("status", "")
        selected_date = request.GET.get("date", "")

        calls = Call.objects.select_related(
            "employee",
            "employee__user"
        ).order_by("-created_at")

        if search:
            calls = calls.filter(
                Q(name__icontains=search) |
                Q(phone__icontains=search) |
                Q(project__icontains=search) |
                Q(status__icontains=search) |
                Q(notes__icontains=search) |
                Q(employee__employee_name__icontains=search)
            )

        if status_filter and status_filter != "All":
            calls = calls.filter(status=status_filter)

        if selected_date:
            calls = calls.filter(created_at__date=selected_date)

        serializer = CallSerializer(calls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        employee_id = request.data.get("employee_id")

        if not employee_id:
            return Response(
                {"employee_id": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = get_object_or_404(Employee, pk=employee_id)

        serializer = CallSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(employee=employee)
            return Response(
                {"message": "Call Added Successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCallDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_object(self, pk):
        return get_object_or_404(Call.objects.select_related("employee"), pk=pk)

    def put(self, request, pk):
        call = self.get_object(pk)

        employee_id = request.data.get("employee_id")
        employee = call.employee
        if employee_id:
            employee = get_object_or_404(Employee, pk=employee_id)

        call.name = request.data.get("name", call.name)
        call.phone = request.data.get("phone", call.phone)
        call.project = request.data.get("project", call.project)
        call.status = request.data.get("status", call.status)
        call.notes = request.data.get("notes", call.notes)

        follow_up = request.data.get("follow_up", call.follow_up)
        call.follow_up = follow_up if follow_up not in ("", None) else None

        call.employee = employee
        call.save()

        return Response(
            {"message": "Call updated successfully"},
            status=status.HTTP_200_OK
        )

    def delete(self, request, pk):
        call = self.get_object(pk)
        call.delete()
        return Response(
            {"message": "Call deleted successfully"},
            status=status.HTTP_200_OK
        )


class AdminReportsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        today = timezone.localdate()

        calls = Call.objects.select_related("employee", "employee__user").all()
        employees = Employee.objects.select_related("user").all()

        total_calls = calls.count()
        leads = calls.filter(status="Interested").count()
        conversions = calls.filter(status="Converted").count()
        closed_deals = calls.filter(status="Closed").count()

        today_followup_qs = calls.filter(follow_up=today)
        overdue_qs = calls.filter(follow_up__lt=today).exclude(status="Closed")

        today_followup_calls = []
        for call in today_followup_qs:
            today_followup_calls.append({
                "id": call.id,
                "name": call.name,
                "phone": call.phone,
                "follow_up": call.follow_up,
                "employee_name": call.employee.employee_name,
            })

        overdue_calls = []
        for call in overdue_qs:
            overdue_calls.append({
                "id": call.id,
                "name": call.name,
                "phone": call.phone,
                "follow_up": call.follow_up,
                "employee_name": call.employee.employee_name,
            })

        employee_performance = []
        for emp in employees:
            emp_calls = calls.filter(employee=emp)
            employee_performance.append({
                "employee_id": emp.id,
                "employee_name": emp.employee_name,
                "total_calls": emp_calls.count(),
                "conversions": emp_calls.filter(status="Converted").count(),
                "closed_deals": emp_calls.filter(status="Closed").count(),
            })

        return Response({
            "total_calls": total_calls,
            "leads": leads,
            "conversions": conversions,
            "closed_deals": closed_deals,
            "today_followups": today_followup_qs.count(),
            "overdue_followups": overdue_qs.count(),
            "employee_performance": employee_performance,
            "today_followup_calls": today_followup_calls,
            "overdue_calls": overdue_calls,
        }, status=status.HTTP_200_OK)