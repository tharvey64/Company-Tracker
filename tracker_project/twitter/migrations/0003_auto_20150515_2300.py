# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('twitter', '0002_profile'),
    ]

    operations = [
        migrations.CreateModel(
            name='Keyword',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, auto_created=True, verbose_name='ID')),
                ('search', models.CharField(max_length=40)),
            ],
        ),
        migrations.RemoveField(
            model_name='tweet',
            name='keyword',
        ),
        migrations.AlterField(
            model_name='tweet',
            name='tweet_id',
            field=models.CharField(max_length=30),
        ),
        migrations.AddField(
            model_name='keyword',
            name='tweet',
            field=models.ManyToManyField(to='twitter.Tweet'),
        ),
    ]
