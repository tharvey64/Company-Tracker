import datetime
from twitter.models import Tweet,Keyword
from sentiment.alchemyapi import AlchemyAPI

def check_tweet_text(text, query):
    if query.lower() not in text.lower():
        return False
    else:
        return True

def alchemy_text_sentiment(alchemy, text):
    alchemy_result = alchemy.sentiment("text", text)
    sentiment = alchemy_result.get('docSentiment')
    return sentiment

def process_list_tweets(user_query,timeline):
    alchemy = AlchemyAPI()
    list_dataset = []
    for unique_tweet in timeline:
        # check if query is in tweet
        if not check_tweet_text(unique_tweet['text'], user_query):
            continue
        # -----------------------------------------------------
        # alchemy_result is a dictionary
        docSentiment = alchemy_text_sentiment(alchemy, unique_tweet['text'])
        if not docSentiment:
            continue
        # set value
        unique_tweet['sentiment'] = docSentiment.get('score', 0)
        # converting to and from datetime 
        unique_tweet['created_at'] = datetime.datetime.strptime(unique_tweet['created_at'], "%a %b %d %X %z %Y")
        
        list_dataset.append(dict(
            date=unique_tweet['created_at'].strftime("%Y-%m-%d %H:%M:%S%z"), 
            height=unique_tweet['sentiment'], 
            radius=unique_tweet['favorite_count'], 
            title=unique_tweet['text']
        ))
    return list_dataset
# ----------------------------------------------------------------------


def stored_tweet(query_set, current_tweet):
    old_tweet = query_set.filter(tweet_id=current_tweet['id_str'])
    # ensure 'id_str' is unique
    if old_tweet and len(old_tweet) == 1:
        old_tweet[0].favorites = current_tweet['favorite_count']
        old_tweet[0].save()
        return old_tweet[0]
    else:
        return None

def create_keywords(list_of_keywords, obj):
    for word in list_of_keywords:
        k, created = Keyword.objects.get_or_create(search=word)
        k.tweet.add(obj)

def make_tweet(current_tweet):
    formatted_date = datetime.datetime.strptime(current_tweet['created_at'], "%a %b %d %X %z %Y")
    
    tweet_obj = Tweet.objects.create(
        text=current_tweet['text'], 
        tweet_id=current_tweet['id_str'], 
        favorites=current_tweet['favorite_count'],
        tweet_date=formatted_date
    )
    keywords = ('#' + tag['text'] for tag in current_tweet['entities']['hashtags'])
    # function doesnt return anything 
    create_keywords(keywords, tweet_obj)
    return tweet_obj

def process_tweets(twitter_results, db_results):
    new_tweets = []
    for response in twitter_results: #iterating through each tweet
        if db_results and stored_tweet(db_results,response):
            continue
        else:
            # custom db search here
            tweet = stored_tweet(Tweet.objects, response)
            if not tweet:
                tweet = make_tweet(response)
            if tweet:
                # can't i use the list i am iterating over
                new_tweets.append(tweet)
    return new_tweets