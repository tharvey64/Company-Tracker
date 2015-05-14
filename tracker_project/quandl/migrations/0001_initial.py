# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('name', models.CharField(max_length=60)),
                ('symbol', models.CharField(unique=True, max_length=15)),
                ('exchange', models.CharField(max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='LastPrice',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('updated_at', models.DateField(default=datetime.date(2004, 12, 31))),
                ('company', models.ForeignKey(to='quandl.Company')),
            ],
        ),
        migrations.CreateModel(
            name='StockPrice',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('open_price', models.DecimalField(max_digits=8, decimal_places=2)),
                ('close_price', models.DecimalField(max_digits=8, decimal_places=2)),
                ('high_price', models.DecimalField(max_digits=8, decimal_places=2)),
                ('low_price', models.DecimalField(max_digits=8, decimal_places=2)),
                ('volume', models.DecimalField(max_digits=12, decimal_places=2)),
                ('created_at', models.DateField()),
                ('company', models.ForeignKey(to='quandl.Company')),
            ],
        ),
    ]
