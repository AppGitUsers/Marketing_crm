from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import status
from django.shortcuts import get_object_or_404

from employees.models import Employee
from calls.models import Call
from .models import Target


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, 'role', None) == 'admin' or request.user.is_superuser)
        )


class AdminTargetListView(APIView):
    """
    GET  /api/targets/admin/?date=YYYY-MM-DD
    Returns all active employees with their fixed daily target and
    how many calls they made on the requested date.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        date_str = request.GET.get('date', str(timezone.localdate()))

        employees = Employee.objects.select_related('user', 'target').filter(is_active=True)

        # Count calls per employee on the requested date
        calls_on_date = Call.objects.filter(created_at__date=date_str).select_related('employee')
        call_counts = {}
        for call in calls_on_date:
            call_counts[call.employee_id] = call_counts.get(call.employee_id, 0) + 1

        result = []
        for emp in employees:
            target_obj = getattr(emp, 'target', None)
            result.append({
                'employee_id': emp.id,
                'employee_name': emp.employee_name,
                'target_id': target_obj.id if target_obj else None,
                'target_count': target_obj.target_count if target_obj else None,
                'calls_done': call_counts.get(emp.id, 0),
            })

        return Response(result, status=status.HTTP_200_OK)


class AdminTargetSetView(APIView):
    """
    POST   /api/targets/admin/set/  — create or update a target for an employee
    DELETE /api/targets/admin/set/  — remove a target
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        employee_id = request.data.get('employee')
        target_count = request.data.get('target_count')

        if not employee_id or not target_count:
            return Response(
                {'detail': 'employee and target_count are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = get_object_or_404(Employee, pk=employee_id)
        target, created = Target.objects.update_or_create(
            employee=employee,
            defaults={'target_count': target_count}
        )

        return Response({
            'id': target.id,
            'employee_id': employee.id,
            'employee_name': employee.employee_name,
            'target_count': target.target_count,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request):
        target_id = request.data.get('target_id')
        if not target_id:
            return Response({'detail': 'target_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        target = get_object_or_404(Target, pk=target_id)
        target.delete()
        return Response({'message': 'Target removed.'}, status=status.HTTP_200_OK)


class EmployeeTargetView(APIView):
    """
    GET /api/targets/my/?date=YYYY-MM-DD
    Employee gets their fixed daily target and calls done on a given date.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_str = request.GET.get('date', str(timezone.localdate()))

        try:
            employee = Employee.objects.select_related('target').get(user=request.user)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        calls_done = Call.objects.filter(employee=employee, created_at__date=date_str).count()

        target_obj = getattr(employee, 'target', None)
        return Response({
            'target_count': target_obj.target_count if target_obj else None,
            'calls_done': calls_done,
            'date': date_str,
        })
