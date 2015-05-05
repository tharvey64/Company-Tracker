# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quandl', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Sentiment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, primary_key=True, auto_created=True)),
                ('result', models.CharField(max_length=8)),
                ('score', models.DecimalField(max_digits=11, decimal_places=10)),
                ('company', models.ForeignKey(to='quandl.Date')),
            ],
        ),
    ]
