from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calls', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='call',
            name='status',
            field=models.CharField(
                choices=[
                    ('Interested', 'Interested'),
                    ('Not Interested', 'Not Interested'),
                    ('Follow Up', 'Follow Up'),
                    ('Converted', 'Converted'),
                    ('Closed', 'Closed'),
                    ('Did Not Pick', 'Did Not Pick'),
                ],
                max_length=50,
            ),
        ),
    ]
