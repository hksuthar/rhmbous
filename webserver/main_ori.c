#include <modbus.h>
#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <sys/param.h>

#include "webservice.h"
#include "packages/json/json.h"

#include <stdlib.h>
#include "hiredis.h"

//#define DBG_PRINT	1

// Register definition file values.
#define DATA_FILE       "/home/debian/webserver/regdef.csv"
#define LINE_LEN        512
#define SEPARATOR       ','

// Set non-zero to use the hardware simulator.
int simulate = 0;

// The maximum number of registers that can be accesses in one command.
#define MAX_COUNT		256

// Shadow register set.
#define REG_MAX			65535		// highest register number
uint16_t shadow_reg[REG_MAX];

DUDA_REGISTER("Duda Modbus I/O Server", "ModBusServer");

// The Modbus context pointers for ttyUSB0 and ttyUSB1.
static modbus_t *ctx0, *ctx1;


void modbus_read_holding(duda_request_t *dr, modbus_t *ctx, int addr_start, int count)
{
    uint16_t reg[MAX_COUNT];
    count = MIN(count, MAX_COUNT);
	if (simulate) {
		for (int i = 0; i < count; i++)
			reg[i] = shadow_reg[addr_start + i];
	}
	else {
		int rc = modbus_read_registers(ctx, addr_start, count, reg);
		if (rc == -1) {
			response->printf(dr, "{\"error\":\"%s\"}\n", modbus_strerror(errno));
			return;
		};
	};
    for (int i = 0; i < count; i++) {
		if (i == 0)
			response->printf(dr, "[\n");
		else
			response->printf(dr, ",\n");
       response->printf(dr, "{\"addr\":%d, \"data\":%d}", addr_start + i,
			reg[i]);
		shadow_reg[addr_start + i] = reg[i];
	};
	response->printf(dr, "\n]");
}


void modbus_read_holding_by_list(duda_request_t *dr, modbus_t *ctx, uint16_t *list, int list_len)
{
    uint16_t reg[MAX_COUNT];
	int reg_count = 0;			// total number of registers read

	// Go through the list doing reads.
	for (int i = 0; i < list_len; i++) {
		uint16_t addr = list[i * 2];
		uint16_t count = list[i * 2 + 1];
#ifdef DBG_PRINT
		fprintf(stdout, "+ read holding %d from %d\n", count, addr);
#endif
		if (reg_count + count > MAX_COUNT)
			break;
		if (simulate) {
			for (int i = 0; i < count; i++)
				reg[reg_count + i] = shadow_reg[addr + i];
		}
		else {
			int rc = modbus_read_registers(ctx, addr, count, reg + reg_count);
			if (rc == -1) {
				response->printf(dr, "{\"error\":\"%s\"}\n", modbus_strerror(errno));
				return;
			};
		};
		reg_count += count;
	};
 
	// Build the respone.
	int reg_count2 = 0;
	response->printf(dr, "[\n");
	for (int i = 0; i < list_len; i++) {
		uint16_t addr = list[i * 2];
		uint16_t count = list[i * 2 + 1];
		if (reg_count2 + count > MAX_COUNT)
			break;
		if (i != 0)
			response->printf(dr, ",\n");
		for (int j = 0; j < count; j++) {
			if (j != 0)
				response->printf(dr, ",\n");
			response->printf(dr, "{\"addr\":%d, \"data\":%d}", addr + j, reg[reg_count2 + j]);
			shadow_reg[addr + j] = reg[reg_count2 + j];
		};
		reg_count2 += count;
    };
	response->printf(dr, "\n]");
}


void modbus_read_input(duda_request_t *dr, modbus_t *ctx, int addr_start, int count)
{
    uint16_t reg[MAX_COUNT];
    count = MIN(count, MAX_COUNT);
	if (simulate) {
		for (int i = 0; i < count; i++)
			reg[i] = shadow_reg[addr_start + i];
	}
	else {
		int rc = modbus_read_input_registers(ctx, addr_start, count, reg);
		if (rc == -1) {
			response->printf(dr, "{\"error\":\"%s\"}\n", modbus_strerror(errno));
			return;
		};
	};
    for (int i = 0; i < count; i++) {
		if (i == 0)
			response->printf(dr, "[\n");
		else
			response->printf(dr, ",\n");
       response->printf(dr, "{\"addr\":%d, \"data\":%d}", addr_start + i,
			reg[i]);
		shadow_reg[addr_start + i] = reg[i];
	};
	response->printf(dr, "\n]");
}


void modbus_read_input_by_list(duda_request_t *dr, modbus_t *ctx, uint16_t *list, int list_len)
{
    uint16_t reg[MAX_COUNT];
	int reg_count = 0;			// total number of registers read

	// Go through the list doing reads.
	for (int i = 0; i < list_len; i++) {
		uint16_t addr = list[i * 2];
		uint16_t count = list[i * 2 + 1];
#ifdef DBG_PRINT
		fprintf(stdout, "+ read input %d from %d\n", count, addr);
#endif
		if (reg_count + count > MAX_COUNT)
			break;
		if (simulate) {
			for (int i = 0; i < count; i++)
				reg[reg_count + i] = shadow_reg[addr + i];
		}
		else {
			int rc = modbus_read_input_registers(ctx, addr, count, reg + reg_count);
			if (rc == -1) {
				response->printf(dr, "{\"error\":\"%s\"}\n", modbus_strerror(errno));
				return;
			};
		};
		reg_count += count;
	};
 
	// Build the respone.
	int reg_count2 = 0;
	response->printf(dr, "[\n");
	for (int i = 0; i < list_len; i++) {
		uint16_t addr = list[i * 2];
		uint16_t count = list[i * 2 + 1];
		if (reg_count2 + count > MAX_COUNT)
			break;
		if (i != 0)
			response->printf(dr, ",\n");
		for (int j = 0; j < count; j++) {
			if (j != 0)
				response->printf(dr, ",\n");
			response->printf(dr, "{\"addr\":%d, \"data\":%d}", addr + j, reg[reg_count2 + j]);
			shadow_reg[addr + j] = reg[reg_count2 + j];
		};
		reg_count2 += count;
    };
	response->printf(dr, "\n]");
}


void modbus_write(duda_request_t *dr, modbus_t *ctx, int addr_start, int data)
{
    uint16_t reg = (uint16_t) data;
	if (simulate) {
		shadow_reg[addr_start] = data;
	}
	else {
		int rc = modbus_write_register(ctx, addr_start, reg);
		if (rc == -1) {
			response->printf(dr, "{\"error\":\"%s\"}\n", modbus_strerror(errno));
		};
    };
}


void init_shadow_reg()
{
    char line[LINE_LEN];
    int reg_count = 0, line_len;
    FILE *f;

    fprintf(stdout, "+ Reading default register values from %s\n", DATA_FILE);
    f = fopen(DATA_FILE, "r");
    if (f == NULL) {
		fprintf(stdout, "+   File not found\n");
		if (simulate)
			for (int i = 0; i < REG_MAX; i++)
				shadow_reg[i] = i;
        return;
	};
    while (fgets(line, LINE_LEN, f) != NULL) {
        line_len = strlen(line);
#ifdef DBG_PRINT
		fprintf(stdout, "%d %s", line_len, line);
#endif
        long reg_num = -1, reg_value = 0;
        for (int i = 0; i < line_len; i++) {
            if (i == 0)
                reg_num = strtol(line, NULL, 10);
            else {
				if (line[i] == SEPARATOR) {
					reg_value = strtol(line + i + 1, NULL, 10);
					break;
				};
			};
        };
        if (reg_num >= 0) {
			fprintf(stdout, "+   %ld = %ld\n", reg_num, reg_value);
            shadow_reg[(uint16_t)reg_num] = (uint16_t)reg_value;
			reg_count++;
        };
    };
	fprintf(stdout, "+   Initialized %d registers\n", reg_count);
}


void cb_query_string(duda_request_t *dr)
{
	modbus_t *ctx;
    response->http_status(dr, 200);

    // Get the number of incoming variables through the Query String.
	int par_count = qs->count(dr);
    if (par_count == 0) {
			response->printf(dr, "{\"error\":\"empty request\"}\n");
        response->end(dr, NULL);
    };

	// Get the query line parameters.
	char *modbus = NULL;
    char *req = NULL;
    char *range = NULL;
	char *data = NULL;

	// Get the Modbus number, if present.
	modbus = qs->get(dr, "m");
	if (modbus == NULL)
		ctx = ctx0;
	else
		ctx = modbus[0] == '1' ? ctx1: ctx0;
	if (ctx == NULL) {
		response->printf(dr, "{\"error\":\"modbus not present\"}\n");
		response->end(dr, NULL);
	};

	// Get the request type.
	req = qs->get(dr, "t");
	if (req == NULL) {
		response->printf(dr, "{\"error\":\"missing request\"}\n");
        response->end(dr, NULL);
	};

	// Get the register range.
	range = qs->get(dr, "r");
	if (range == NULL) {
		response->printf(dr, "{\"error\":\"missing range\"}\n");
        response->end(dr, NULL);
	};

	// Write requests must have data.
	data = qs->get(dr, "d");
	if (*req == 'w' && data == NULL) {
		response->printf(dr, "{\"error\":\"missing data\"}\n");
        response->end(dr, NULL);
	};

#ifdef DBG_PRINT
	fprintf(stdout, "+ modbus=%c reg=%s range=%s data=%s\n", modbus[0], req, range, data);
#endif

    // Extract the range values ("start" or "start:count" separated by commas).
	uint16_t list[MAX_COUNT * 2];	// list of address:count pairs
	int list_len = 0;				// number of list entries

	char *rangep = range;
	char *sep = rangep;
	uint16_t addr = 0, count = 0;
	for(; *rangep; ) {
#ifdef DBG_PRINT
		fprintf(stdout, "+   %s %s\n", rangep, sep);
#endif
		switch(*sep) {

		// Check for the end of a range.
		case ',':
		case '\0':
			if (addr == 0) {
				// No count was specified.
				addr = atoi(rangep);
				count = 1;
			}
			else {
				count = atoi(rangep);
			};
#ifdef DBG_PRINT
			fprintf(stdout, "+   range sep addr=%d count=%d\n", addr, count);
#endif
			if (addr != 0 && count != 0) {
				list[list_len * 2] = addr;
				list[list_len * 2 + 1] = count;
				list_len++;
#ifdef DBG_PRINT
				fprintf(stdout, "+   list_len=%d\n", list_len);
#endif
			};
			addr = count = 0;

			// Advance if not at the end of the string.
			if (*sep != '\0')
				++sep;
			rangep = sep;
			break;

		// Check for a count separator.
		case ':':
			// Get the address.
			addr = atoi(rangep);
#ifdef DBG_PRINT
			fprintf(stdout, "+ count sep addr=%d\n", addr);
#endif
			rangep = ++sep;
			break;

		default:
			++sep;
		};
	};

#ifdef DBG_PRINT
	fprintf(stdout, "+ list_len: %d\n", list_len);
	for (int i = 0; i < list_len; i++)
		fprintf(stdout, "+ addr:count %d:%d\n", list[i * 2], list[i * 2 + 1]);
#endif

    // Request servicing.
    switch (*req) {
    case 'h':
		modbus_read_holding_by_list(dr, ctx, list, list_len);
        break;

    case 'i':
		modbus_read_input_by_list(dr, ctx, list, list_len);
        break;

    case 'w':
		modbus_write(dr, ctx, list[0], atoi(data));
        break;
    };
    response->end(dr, NULL);
}


int hiredis_data(int argc, char **argv) 
{
	printf("\nHello I am harsh\n\n");    
	redisReply *reply;
    	redisContext *c = redisConnect("127.0.0.1", 6379);
    
    if (c == NULL || c->err) {
        if (c) {
            printf("Connection error: %s\n", c->errstr);
            redisFree(c);
        } else {
            printf("Connection error: can't allocate redis context\n");
        }
        exit(1);
    }


    /* Set a key */
    reply = redisCommand(c,"SET %s %s", "Harsh", "patel");
    printf("SET: %s\n", reply->str);
    freeReplyObject(reply);
     return 0;

}



int duda_main()
{
	duda_load_package(json, "json");

    // Set up Modbus communications.
	if (simulate) {
		fprintf(stdout, "+ Simulation Mode.\n");
        init_shadow_reg();
	} else {
		// Set up a Modbus connection to CIU 0.
		ctx0 = modbus_new_rtu("/dev/ttyS0", 19200, 'N', 8, 1);
		if (modbus_connect(ctx0) == -1) {
			fprintf(stdout, "+ ttyUSB0 connection failed: %s\n", modbus_strerror(errno));
			modbus_free(ctx0);
			ctx0 = NULL;
		}
		else {
			modbus_set_slave(ctx0, 2);
			fprintf(stdout, "+ ttyUSB0 connection active\n");
		};

		// Set up a Modbus connection to CIU 1.
		ctx1 = modbus_new_rtu("/dev/ttyS1", 19200, 'N', 8, 1);
		if (modbus_connect(ctx1) == -1) {
			fprintf(stdout, "+ ttyUSB1 connection failed: %s\n", modbus_strerror(errno));
			modbus_free(ctx1);
			ctx1 = NULL;
		}
		else {
			modbus_set_slave(ctx1, 2);
			fprintf(stdout, "+ ttyUSB1 connection active\n");
		};
		/*ctx0 = modbus_new_tcp("192.168.56.1",1502);
		if(ctx0==NULL)
			{
				fprintf(stderr,"Unable to allocate libmodbus context\n");
			return-1;
			}
		if (modbus_connect(ctx0) == -1) {
			fprintf(stdout, "Connection failed: %s\n", modbus_strerror(errno));
			modbus_free(ctx0);
			return -1;
		};
		modbus_set_slave(ctx0, 2);*/
	};

    // Add routing for the URL string.
	fprintf(stdout, "+ Adding URL route\n");
	map->static_add("/", "hiredis_data");
    	//map->static_add("/", "cb_query_string");
    return 0;
}
