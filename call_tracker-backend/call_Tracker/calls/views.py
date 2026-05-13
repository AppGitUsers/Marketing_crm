from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from .models import Call
from .serializers import CallSerializer
from employees.models import Employee


class CallCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CallSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(employee=employee)
            return Response(
                {"message": "Call Added Successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployeeCallsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, "role", None) != "employee":
            raise PermissionDenied("Only employees can access this endpoint.")

        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        calls = Call.objects.filter(employee=employee).order_by("-created_at")
        serializer = CallSerializer(calls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CallDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return None

        return get_object_or_404(Call, pk=pk, employee=employee)

    def put(self, request, pk):
        call = self.get_object(request, pk)
        if call is None:
            return Response(
                {"detail": "Employee profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CallSerializer(call, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Call Updated Successfully"},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        call = self.get_object(request, pk)
        if call is None:
            return Response(
                {"detail": "Employee profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        call.delete()
        return Response(
            {"message": "Call Deleted Successfully"},
            status=status.HTTP_200_OK
        )