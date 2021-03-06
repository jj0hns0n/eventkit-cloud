from django.contrib.auth.models import User
from django.db import models


class OAuth(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, blank=False)
    identification = models.CharField(max_length=200, unique=True, blank=False)
    commonname = models.CharField(max_length=100, blank=False)

    class Meta:  # pragma: no cover
        managed = True
        db_table = 'auth_oauth'