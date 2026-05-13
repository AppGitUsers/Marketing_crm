from django.db import models
from employees.models import Employee


class Call(models.Model):

    STATUS_CHOICES = (
        ('Interested', 'Interested'),
        ('Not Interested', 'Not Interested'),
        ('Follow Up', 'Follow Up'),
        ('Converted', 'Converted'),
        ('Closed', 'Closed'),
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='calls'
    )

    name = models.CharField(
        max_length=100
    )

    phone = models.CharField(
        max_length=15
    )

    project = models.CharField(
        max_length=100
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    follow_up = models.DateField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name