from rest_framework import serializers
from .models import Call


class CallSerializer(serializers.ModelSerializer):
    employee_id = serializers.IntegerField(source="employee.id", read_only=True)
    employee_name = serializers.CharField(source="employee.employee_name", read_only=True)

    class Meta:
        model = Call
        fields = [
            "id",
            "employee",
            "employee_id",
            "employee_name",
            "name",
            "phone",
            "project",
            "status",
            "notes",
            "follow_up",
            "created_at",
        ]
        read_only_fields = [
            "employee",
            "employee_id",
            "employee_name",
            "created_at",
        ]