import secrets
import string
from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from employees.models import Employee


def generate_temp_password(length=10):
    alphabet = string.ascii_letters + string.digits + "@#$%!"
    return "".join(secrets.choice(alphabet) for _ in range(length))


class AdminEmployeeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    employee_id = serializers.CharField(read_only=True)
    employee_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    department = serializers.CharField()
    designation = serializers.CharField()
    salary = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        default=0
    )
    is_active = serializers.BooleanField(required=False, default=True)
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        allow_null=True
    )

    def validate_username(self, value):
        qs = User.objects.filter(username=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.user.id)
        if qs.exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        qs = User.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.user.id)
        if qs.exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "employee_id": instance.employee_id,
            "employee_name": instance.employee_name,
            "username": instance.user.username,
            "email": instance.email or instance.user.email,
            "phone": instance.phone or instance.user.phone,
            "department": instance.department,
            "designation": instance.designation,
            "salary": str(instance.salary),
            "is_active": instance.is_active,
            "created_at": instance.created_at,
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None) or generate_temp_password()

        username = validated_data.pop("username")
        email = validated_data.pop("email")
        phone = validated_data.pop("phone", "")
        employee_name = validated_data.pop("employee_name")
        department = validated_data.pop("department")
        designation = validated_data.pop("designation")
        salary = validated_data.pop("salary", 0)
        is_active = validated_data.pop("is_active", True)

        user = User(
            username=username,
            email=email,
            phone=phone,
            role="employee",
            is_active=is_active,
        )
        user.set_password(password)
        user.save()

        employee = Employee.objects.create(
            user=user,
            employee_id=f"EMP{user.id}",
            employee_name=employee_name,
            department=department,
            designation=designation,
            phone=phone,
            email=email,
            salary=salary,
            is_active=is_active,
            joining_date=timezone.localdate(),
        )

        employee.generated_password = password
        return employee

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        username = validated_data.pop("username", None)
        email = validated_data.pop("email", None)
        phone = validated_data.pop("phone", None)
        employee_name = validated_data.pop("employee_name", None)
        department = validated_data.pop("department", None)
        designation = validated_data.pop("designation", None)
        salary = validated_data.pop("salary", None)
        is_active = validated_data.pop("is_active", None)

        user = instance.user

        if username is not None:
            user.username = username
        if email is not None:
            user.email = email
        if phone is not None:
            user.phone = phone
        if is_active is not None:
            user.is_active = is_active

        user.role = "employee"
        user.save()

        if employee_name is not None:
            instance.employee_name = employee_name
        if department is not None:
            instance.department = department
        if designation is not None:
            instance.designation = designation
        if salary is not None:
            instance.salary = salary
        if is_active is not None:
            instance.is_active = is_active
        if phone is not None:
            instance.phone = phone
        if email is not None:
            instance.email = email

        instance.save()

        if password:
            user.set_password(password)
            user.save()

        return instance