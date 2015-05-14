# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sentiment', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tweet',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('text', models.CharField(max_length=180)),
                ('tweet_id', models.BigIntegerField()),
                ('favorites', models.IntegerField()),
                ('tweet_date', models.DateTimeField()),
                ('keyword', models.CharField(max_length=200)),
                ('sentiment', models.ForeignKey(to='sentiment.Sentiment')),
            ],
        ),
    ]
