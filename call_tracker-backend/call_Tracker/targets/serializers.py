from rest_framework import serializers
from .models import Target


class TargetSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)
    employee_id = serializers.IntegerField(source='employee.id', read_only=True)

    class Meta:
        model = Target
        fields = ['id', 'employee', 'employee_id', 'employee_name', 'date', 'target_count', 'updated_at']
        read_only_fields = ['id', 'employee_id', 'employee_name', 'updated_at']
