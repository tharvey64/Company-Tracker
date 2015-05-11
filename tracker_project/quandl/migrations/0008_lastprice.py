# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quandl', '0007_auto_20150506_1834'),
    ]

    operations = [
        migrations.CreateModel(
            name='LastPrice',
            fields=[
                ('id', models.AutoField(auto_created=True, serialize=False, verbose_name='ID', primary_key=True)),
                ('updated_at', models.DateTimeField()),
                ('company', models.ForeignKey(to='quandl.Company')),
            ],
        ),
    ]
