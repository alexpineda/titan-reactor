/************************************************************************/
/* File Name   : isomap.h                                               */
/* Creator     : ax.minaduki@gmail.com                                  */
/* Create Time : April 11st, 2010                                       */
/* Module      : Lawine library                                         */
/* Descript    : Isometric map API definition                           */
/************************************************************************/

#ifndef __SD_LAWINE_MISC_ISOMAP_H__
#define __SD_LAWINE_MISC_ISOMAP_H__

/************************************************************************/

#include <common.h>
#include <lawinedef.h>

/************************************************************************/

#define CALC_ISOM_LINE(y) ((y) + 1)
#define CALC_ISOM_ROW(x) ((x) / 2 + 1)

/************************************************************************/

typedef struct
{
    INT era;       /* ERA */
    INT def;       /* 默认地形 */
    SIZE size;     /* 地图大小 */
    LISOMPTR isom; /* ISOM数据 */
    LTILEPTR tile; /* TILE数据 */
    VPTR dirty;    /* 脏标志位图 */
} ISOM_MAP;

typedef struct
{
    WORD type;        /* TILE类型 */
    WORD left_abut;   /* TILE左侧邻接关系ID */
    WORD top_abut;    /* TILE上方邻接关系ID */
    WORD right_abut;  /* TILE右侧邻接关系ID */
    WORD bottom_abut; /* TILE下方邻接关系ID */
    WORD up_abut;     /* TILE上层邻接关系ID */
    WORD down_abut;   /* TILE下层邻接关系ID */
} ISOM_TILE;

typedef struct
{
    WORD group_no;  /* TILE编组序号 */
    WORD mega_mask; /* MegaTile存在性掩码 */
    ISOM_TILE tile; /* TILE索引 */
} ISOM_DICT;

/************************************************************************/

CAPI extern BOOL init_iso_map(VOID);
CAPI extern VOID exit_iso_map(VOID);
CAPI extern BOOL init_iso_era(INT era, CONST ISOM_DICT *tile_dict, UINT tile_num);
CAPI extern VOID exit_iso_era(INT era);
CAPI extern BOOL create_iso_map(ISOM_MAP *map, BOOL new_map);
CAPI extern VOID destroy_iso_map(ISOM_MAP *map);
CAPI extern BOOL brush_iso_map(ISOM_MAP *map, INT brush, CONST POINT *tile_pos);
CAPI extern BOOL update_iso_map(CONST ISOM_MAP *map);

/************************************************************************/

#endif /* __SD_LAWINE_MISC_ISOM_H__ */