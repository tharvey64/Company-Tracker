# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Keyword',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, primary_key=True, auto_created=True)),
                ('search', models.CharField(max_length=40)),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, primary_key=True, auto_created=True)),
                ('token', models.CharField(max_length=180)),
                ('secret', models.CharField(max_length=180)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Tweet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, primary_key=True, auto_created=True)),
                ('text', models.CharField(max_length=180)),
                ('tweet_id', models.CharField(max_length=30)),
                ('favorites', models.IntegerField()),
                ('tweet_date', models.DateTimeField()),
            ],
        ),
        migrations.AddField(
            model_name='keyword',
            name='tweet',
            field=models.ManyToManyField(to='twitter.Tweet'),
        ),
    ]
