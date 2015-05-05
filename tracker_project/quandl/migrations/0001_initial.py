# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='ID', auto_created=True)),
                ('name', models.CharField(max_length=40)),
                ('ticker', models.CharField(max_length=30)),
                ('exchange', models.CharField(max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Date',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='ID', auto_created=True)),
                ('year', models.PositiveIntegerField()),
                ('month', models.PositiveIntegerField()),
                ('day', models.PositiveIntegerField()),
                ('hour', models.PositiveIntegerField()),
                ('minute', models.PositiveIntegerField()),
                ('seconds', models.PositiveIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='StockPrice',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='ID', auto_created=True)),
                ('open_price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('close_price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('high_price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('low_price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('volume', models.DecimalField(decimal_places=2, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(to='quandl.Company')),
                ('date', models.ForeignKey(to='quandl.Date')),
            ],
        ),
    ]
