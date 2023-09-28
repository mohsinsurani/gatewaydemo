from django.conf import settings
from django.db import models

if not settings:
    settings.configure()


# Create Admin models.
class Administrator(models.Model):
    # Django model fields
    username = models.CharField(max_length=100, blank=False, null=False, unique=True)

    def __str__(self):
        return f"{self.username}"

    class Meta:
        app_label = 'gatewayapp'


# Create Operator models.
class Operator(models.Model):
    username = models.CharField(max_length=100, unique=True)
    admin = models.ForeignKey(Administrator, on_delete=models.PROTECT, null=False)

    class Meta:
        app_label = 'gatewayapp'


# Create Gateway models.
class Gateway(models.Model):
    antenna_diameter = models.DecimalField(max_digits=9, decimal_places=6)
    location_name = models.CharField(max_length=100, null=False, unique=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    admin = models.ForeignKey(Administrator, on_delete=models.PROTECT, null=False)

    class Meta:
        app_label = 'gatewayapp'
