from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('employees', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Target',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('target_count', models.PositiveIntegerField()),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('employee', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='target',
                    to='employees.employee',
                )),
            ],
        ),
    ]
