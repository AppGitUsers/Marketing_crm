from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from employees.models import Employee

from .serializers import RegisterSerializer


def is_admin_user(user):
    return bool(
        user
        and user.is_authenticated
        and (getattr(user, "role", None) == "admin" or user.is_superuser)
    )


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user)


class RegisterView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User Registered Successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid username or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        # Superusers are treated as admins throughout the system
        role = "admin" if (user.is_superuser or getattr(user, "role", None) == "admin") else getattr(user, "role", "employee")

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "role": role,
        }, status=status.HTTP_200_OK)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_superuser or getattr(user, "role", None) == "admin":
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": getattr(user, "phone", None),
                "role": "admin",
            })

        employee = Employee.objects.filter(user=user).first()
        if not employee:
            return Response(
                {"detail": "Employee profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({
            "employee_id": employee.employee_id,
            "employee_name": employee.employee_name,
            "department": employee.department,
            "designation": employee.designation,
            "phone": employee.phone,
            "email": employee.email,
            "role": user.role,
        })