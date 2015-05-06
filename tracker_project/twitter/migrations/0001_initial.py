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
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('result', models.CharField(max_length=8)),
                ('score', models.DecimalField(max_digits=11, decimal_places=10)),
                ('created_at', models.DateField(auto_now_add=True)),
                ('company', models.ForeignKey(to='quandl.Company')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
