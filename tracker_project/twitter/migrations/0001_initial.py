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
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='ID', auto_created=True)),
                ('result', models.CharField(max_length=8)),
                ('score', models.DecimalField(decimal_places=10, max_digits=11)),
                ('company', models.ForeignKey(to='quandl.Company')),
                ('date', models.ForeignKey(to='quandl.Date')),
            ],
        ),
    ]
