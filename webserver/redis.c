#include <stdio.h>
#include <string.h>
#include <time.h>
#include "packages/kv/kv.h"
#include "packages/redis/hiredis.h"

#define CHECK(X) if ( !X || X->type == REDIS_REPLY_ERROR ) { printf("Error\n"); exit(-1); }

int set_data(int addr_start, int data){
	
	redisReply *reply;
	int add = addr_start;
	int da = data;
	int password = "12345";
	char uuid[50];
	unsigned long ID = (unsigned long)time(NULL);
	printf("%lu\n", ID);
	sprintf(uuid, "23055a8e0e0541ceb0ddd9fa87c99bb8:%d", add);
	printf("Key : %s\n",uuid);
	redisContext *c = redisConnect("127.0.0.1",6379);
	if (c->err) {
    	printf("Error from serv: %s\n", c->errstr);
	}else{
    	printf("Connection Made! \n");
	}
	// Set a key
	reply = redisCommand(c,"AUTH 12345");
	freeReplyObject(reply);
	reply = redisCommand(c,"ZADD %s %lu %lu:%d ", uuid, (unsigned long)time(NULL), ID, add);
    CHECK(reply);
    freeReplyObject(reply);
    reply = redisCommand(c,"HSET %lu:%d  %lu %d", ID, add, (unsigned long)time(NULL), da);
    CHECK(reply);
    freeReplyObject(reply);
    //printf("ZADD: %s %lu %lu:%d\n", uuid, (unsigned long)time(NULL), ID, add);
    //printf("HSET: %lu:%d  %lu %d\n", ID, add, (unsigned long)time(NULL), da);
}

redisReply *get_data(duda_request_t *dr, int addr_start){
	
	redisReply *reply, *reply2;
	//long long int timestamp1 = 1498867200;
	//long long int timestamp2 = (unsigned long)time(NULL);
	int add = addr_start, j;
	char uuid[50];
	redisContext *c = redisConnect("127.0.0.1",6379);
	if (c->err) {
        	printf("Error from serv: %s\n", c->errstr);
    	}else{
        	printf("Connection Made! \n");
    	}
	
	sprintf(uuid, "23055a8e0e0541ceb0ddd9fa87c99bb8:%d", add);
	//printf("Keys %s", uuid);
	// Get a key 
	reply = redisCommand(c,"AUTH 12345");
	freeReplyObject(reply);
    reply = redisCommand(c,"zrange %s 0 -1", uuid);
	CHECK(reply);
	if(reply->type==REDIS_REPLY_ARRAY)
     {
         int i=0;
         for(i=0; i<reply->elements; i++)
         {
            //printf("reply %s\n",reply->element[i]->str);
            reply2 = redisCommand(c, "HGETALL %s", reply->element[i]->str);
            int j=0;
			for(j=0; j<reply2->elements; j++)
			{
				if (i != 0)
				response->printf(dr, ",\n"); 	
				
				//printf(" %s) %s\n",reply2->element[j]->str,reply2->element[j+1]->str);
				response->printf(dr, "{\"timestamp\":%s, \"data\":%s}", reply2->element[j]->str, reply2->element[j+1]->str);
				j++;
			}
         }
     }   
}
