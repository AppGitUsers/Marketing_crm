from rest_framework import serializers
from .models import User
from employees.models import Employee
from django.utils import timezone


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "role",
            "password",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)

        # Optional: if you want admin to access Django admin panel
        if user.role == "admin":
            user.is_staff = True
            user.is_superuser = False

        user.save()

        if user.role == "employee":
            Employee.objects.create(
                user=user,
                employee_id=f"EMP{user.id}",
                employee_name=user.username,
                department="Telecaller",
                designation="Employee",
                phone=user.phone,
                email=user.email,
                joining_date=timezone.localdate(),
            )

        return user