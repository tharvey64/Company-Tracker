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
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('name', models.CharField(max_length=60)),
                ('symbol', models.CharField(max_length=15, unique=True)),
                ('exchange', models.CharField(max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='StockPrice',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('open_price', models.DecimalField(max_digits=8, decimal_places=2)),
                ('close_price', models.DecimalField(max_digits=8, decimal_places=2)),
                ('high_price', models.DecimalField(max_digits=8, decimal_places=2)),
                ('low_price', models.DecimalField(max_digits=8, decimal_places=2)),
                ('volume', models.DecimalField(max_digits=10, decimal_places=2)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(to='quandl.Company')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
