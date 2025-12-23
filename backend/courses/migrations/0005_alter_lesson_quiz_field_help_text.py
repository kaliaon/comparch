# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_alter_lesson_quiz'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lesson',
            name='quiz',
            field=models.JSONField(default=dict, help_text="Deprecated: Use Test model instead"),
        ),
    ] 