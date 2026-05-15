from django.db import models
from employees.models import Employee


class Target(models.Model):
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='target'
    )
    target_count = models.PositiveIntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.employee_name} — {self.target_count} calls/day"
