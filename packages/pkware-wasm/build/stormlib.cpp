
#include <iostream>

#include <stdio.h>

#include "pklib.h"
#include <assert.h>

#ifndef far
#define far
#endif

typedef unsigned char BYTE;
typedef BYTE far *LPBYTE;

#define STORM_ALLOC(type, nitems) (type *)malloc((nitems) * sizeof(type))
#define STORM_REALLOC(type, ptr, nitems) (type *)realloc(ptr, ((nitems) * sizeof(type)))
#define STORM_FREE(ptr) free(ptr)

// Information about the input and output buffers for pklib
typedef struct
{
	unsigned char *pbInBuff;	 // Pointer to input data buffer
	unsigned char *pbInBuffEnd;	 // End of the input buffer
	unsigned char *pbOutBuff;	 // Pointer to output data buffer
	unsigned char *pbOutBuffEnd; // Pointer to output data buffer
} TDataInfo;

// Function loads data from the input buffer. Used by Pklib's "implode"
// and "explode" function as user-defined callback
// Returns number of bytes loaded
//
//   char * buf          - Pointer to a buffer where to store loaded data
//   unsigned int * size - Max. number of bytes to read
//   void * param        - Custom pointer, parameter of implode/explode

static unsigned int ReadInputData(char *buf, unsigned int *size, void *param)
{
	TDataInfo *pInfo = (TDataInfo *)param;
	unsigned int nMaxAvail = (unsigned int)(pInfo->pbInBuffEnd - pInfo->pbInBuff);
	unsigned int nToRead = *size;

	// Check the case when not enough data available
	if (nToRead > nMaxAvail)
		nToRead = nMaxAvail;

	// Load data and increment offsets
	memcpy(buf, pInfo->pbInBuff, nToRead);
	pInfo->pbInBuff += nToRead;
	assert(pInfo->pbInBuff <= pInfo->pbInBuffEnd);
	return nToRead;
}

// Function for store output data. Used by Pklib's "implode" and "explode"
// as user-defined callback
//
//   char * buf          - Pointer to data to be written
//   unsigned int * size - Number of bytes to write
//   void * param        - Custom pointer, parameter of implode/explode

static void WriteOutputData(char *buf, unsigned int *size, void *param)
{
	TDataInfo *pInfo = (TDataInfo *)param;
	unsigned int nMaxWrite = (unsigned int)(pInfo->pbOutBuffEnd - pInfo->pbOutBuff);
	unsigned int nToWrite = *size;

	// Check the case when not enough space in the output buffer
	if (nToWrite > nMaxWrite)
		nToWrite = nMaxWrite;

	// Write output data and increments offsets
	memcpy(pInfo->pbOutBuff, buf, nToWrite);
	pInfo->pbOutBuff += nToWrite;
	assert(pInfo->pbOutBuff <= pInfo->pbOutBuffEnd);
}

extern "C"
{
	int Compress_PKLIB(void *pvOutBuffer, int *pcbOutBuffer, void *pvInBuffer, int cbInBuffer, int dictSize)
	{
		TDataInfo Info;										 // Data information
		char *work_buf = STORM_ALLOC(char, CMP_BUFFER_SIZE); // Pklib's work buffer
		unsigned int dict_size = dictSize;					 // Dictionary size
		unsigned int ctype = CMP_BINARY;					 // Compression type

		// Handle no-memory condition
		if (work_buf != NULL)
		{
			// Fill data information structure
			memset(work_buf, 0, CMP_BUFFER_SIZE);
			Info.pbInBuff = (unsigned char *)pvInBuffer;
			Info.pbInBuffEnd = (unsigned char *)pvInBuffer + cbInBuffer;
			Info.pbOutBuff = (unsigned char *)pvOutBuffer;
			Info.pbOutBuffEnd = (unsigned char *)pvOutBuffer + *pcbOutBuffer;

			//
			// Set the dictionary size
			//
			// Diablo I uses fixed dictionary size of CMP_IMPLODE_DICT_SIZE3
			// Starcraft I uses the variable dictionary size based on algorithm below
			//

			// Do the compression
			unsigned int result = implode(ReadInputData, WriteOutputData, work_buf, &Info, &ctype, &dict_size);
			if (result == CMP_NO_ERROR)
				*pcbOutBuffer = (int)(Info.pbOutBuff - (unsigned char *)pvOutBuffer);

			STORM_FREE(work_buf);

			return result;
		}

		return CMP_ABORT;
	}

	int Decompress_PKLIB(void *pvOutBuffer, int *pcbOutBuffer, void *pvInBuffer, int cbInBuffer)
	{
		TDataInfo Info;										 // Data information
		char *work_buf = STORM_ALLOC(char, EXP_BUFFER_SIZE); // Pklib's work buffer

		// Handle no-memory condition
		if (work_buf == NULL)
			return 0;

		// Fill data information structure
		memset(work_buf, 0, EXP_BUFFER_SIZE);
		Info.pbInBuff = (unsigned char *)pvInBuffer;
		Info.pbInBuffEnd = (unsigned char *)pvInBuffer + cbInBuffer;
		Info.pbOutBuff = (unsigned char *)pvOutBuffer;
		Info.pbOutBuffEnd = (unsigned char *)pvOutBuffer + *pcbOutBuffer;

		// Do the decompression
		explode(ReadInputData, WriteOutputData, work_buf, &Info);

		// If PKLIB is unable to decompress the data, return 0;
		if (Info.pbOutBuff == pvOutBuffer)
		{
			STORM_FREE(work_buf);
			return 0;
		}

		// Give away the number of decompressed bytes
		*pcbOutBuffer = (int)(Info.pbOutBuff - (unsigned char *)pvOutBuffer);
		STORM_FREE(work_buf);
		return 1;
	}
}