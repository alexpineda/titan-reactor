/************************************************************************/
/* File Name   : isomap.c                                               */
/* Creator     : ax.minaduki@gmail.com                                  */
/* Create Time : April 11st, 2010                                       */
/* Module      : Lawine library                                         */
/* Descript    : Isometric map API implementation                       */
/************************************************************************/

#include "isomap.h"

/*
	Glossary：

	1. ISOM value(isom)		The value of the ISOM section of the map file.
	2. ISOM diamond			A diamond surrounded by 8 equal ISOM values.
                            It can be divided into 4 orthogonal corner diamonds.
	3. Corner diamond		Each ISOM diamond is a small diamond on the upper left and lower right corners. 
                            The edge shape is very important when dealing with it.
	4. TILE(diamond)		Starting from the far left of the map, every two tiles form a rectangle.
							Each such rectangle corresponds to a diamond data structure LISOMTILE.
							Such a diamond is called a TILE diamond. Sometimes this rectangle is also referred to as TILE diamond for short.
	5. Paint brush			Corresponds to the L_BRUSH_XXX enumeration, which represents the type of terrain brush.
							Each brush corresponds to a type of terrain.
							The ID of the brush is equal to the index of the corresponding central terrain.
	6. Paint brush rhombus	ISOM diamond occupied by the brush.
							Intuitively, it is the diamond that shows the brush position in staredit.
	7. Terrain		        The terrain that the brush directly corresponds to, such as Dirt, Water, etc.
	8. Central terrain		Each corner of the ISOM diamond is a single terrain.
							Obviously in the same ERA, its number is the same as the number of terrain.
							Since the brushes, terrain, and central terrain are in one-to-one correspondence, sometimes they are not distinguished.
	9. Edge terrain 		The junction of two different terrains.
							The corner terrain of the ISOM diamond has two values.
	10.Edge shape		    The combination of 4 corner diamonds of the edge terrain. There are 14 kinds in total.
	11.Horizontal adjacency(h-abut)		
                            The adjacency relationship of each TILE in the four directions of upper left and lower right on the XY plane.
							The ID format is the same as left_abut, top_abut, right_abut and bottom_abut of CV5.
	12.Vertical adjacency(v-abut)		
                            The upper and lower adjacency relationship of each TILE on the Z axis.
							The ID format is the same as up_abut and down_abut of CV5, which directly corresponds to V_ABUT_XXX.
	13.Connection (link)	If two terrains can be combined into edges, they are said to be connectable.
							The connection is directional, and one of the two ends of the connection must be on the upper layer and the other on the lower layer.
	14.Covered terrain(overlap)	
                            The terrain type that does not produce cliffs when intersecting with the underlying terrain. Such as Grass, Mud, etc.
	15.Split terrain(layer)	That is, non-covered terrain. Such as Water, Dirt, High Dirt, etc.
	16.Padded terrain(matted)	
                            The bedding terrain must be a layered terrain.
							When this kind of terrain connects with the terrain below to form an edge, the terrain below it is required to be at least further away
							Extend a brush diamond to form a base. Such as Structure, Temple, etc.
	17.Diffuse terrain  	Diffusion terrain must be covered terrain.
							When this kind of terrain covers the underlying terrain, in the shape of LHHH and HHLH,
							It occupies more area than non-diffusion terrain in the horizontal direction (reflected in the horizontal adjacency),
							Therefore, this type of terrain looks fatter than the non-diffusion type.
	18.Tiled terrain		The tile-shaped terrain must be an overlying terrain.
							When this type of terrain covers the underlying terrain, it is usually paved like a square brick.
							Such as Asphalt, Plating, etc.
	19.Stepped terrain		The unique terrain of Installation includes only three terrains: Substructure, Floor and Roof.
							They are all layered terrain.
							The cliffs of this type of terrain are vertical platforms, but not all vertical platforms are stepped terrain.
							For example, Temple is not.
	20.Roof topography		Only Roof is this type of terrain.
							It is a bit special in the algorithm for generating vertical adjacency relations, which is different from all other terrains.
	21.悬崖(cliff)			Cliffs are formed at the edges of the two layered terrains (ie, non-covered terrain).
							However, the edges of layered terrain and overlying terrain, overlying terrain and overlying terrain will not appear.
	22.TILE类型(type)		The terrain type of a tile. It may be some kind of central terrain or edge type.
							Each TILE type has a corresponding unique ID.
	23.TILE位置(position)	It is a constant that indicates which corner of the TILE diamond is up, down, left, and right.
							There is a difference between odd diamonds and even diamonds.

	Note: This source file does not consider the issue of multi-thread synchronization.
*/

/************************************************************************/

/* Vertical adjacency ID constant */
#define V_ABUT_NONE 0   /* none */
#define V_ABUT_CENTER 1 /* central */
#define V_ABUT_LEFT 2   /* Left margin */
#define V_ABUT_RIGHT 3  /* Right margin */

#define SHAPE_NUM 14 /* Edge shape number */
#define CLIFF_NUM 4  /* The number of horizontal adjacency IDs corresponding to each cliff terrain */

#define MAX_CENTER 13 /* Maximum number of central terrain types（Jungle/Desert/Ice/Twilight） */
#define MAX_EDGE 12   /* Maximum number of edge terrain types（Jungle/Desert/Ice/Twilight） */
#define MAX_LINK 6    /* Maximum number of connections in one direction（Platform:Platform） */

#define MAX_SHAPE_ID 16      /* Maximum edge shape index + 1 */
#define MAX_CENTER_ISOM 0x0f /* Maximum ISOM value for central terrain（Platform:Dark Platform） + 1 */

#define CENTER_FLAG 0x00  /* 0x0# TILE boundary ID indicating the direct use of low-level terrain */
#define DIFFUSE_FLAG 0x10 /* 0x1# Indicates that if it is a diffuse terrain, use the TILE boundary ID of the high-level terrain, otherwise use the corresponding value of SIDE_MASK */
#define CLIFF_FLAG 0x20   /* 0x2# Indicates that if it is a cliff terrain, use the TILE boundary ID of the corresponding cliff, otherwise use the TILE boundary ID of the lower terrain */
#define SIDE_FLAG 0x30    /* 0x3# Indicates that the constant is used directly (it actually represents the 8 directions of the edge) */
#define MAP_FLAG_MASK 0xf0

/************************************************************************/

#define for_each_from(from) for ((from) = 0; (from) < FROM_NUM; (from)++)

#define REVERSE(order) (!(order))
#define OPPOSITE(from) (((from) + FROM_NUM / 2) % FROM_NUM)
#define SIDE_OF_FROM(from) ((((from) + 1) % FROM_NUM) / (FROM_NUM / 2))
#define DIR1_OF_FROM(from) (from)
#define DIR2_OF_FROM(from) (((from) + 1) % FROM_NUM)
#define X_DIR_OF_FROM(from) ((((from) + 1) % FROM_NUM) / (FROM_NUM / 2) * (FROM_NUM / 2))
#define Y_DIR_OF_FROM(from) ((from) / (FROM_NUM / 2) * (FROM_NUM / 2) + 1)
#define IS_FROM_DIR(from, dir) ((from) == (dir) || ((from) + 1) % FROM_NUM == (dir))
#define MAKE_SHAPE_ID(l, t, r, b) (((l) << LEFT) | ((t) << TOP) | ((r) << RIGHT) | ((b) << BOTTOM))
#define LOC_MAP_POS(data, pos, size) ((data) + (pos)->x + (pos)->y * CALC_ISOM_ROW((size)->cx))
#define CALC_DIRTY_SIZE(size) ((CALC_ISOM_ROW((size)->cx) * CALC_ISOM_LINE((size)->cy)) >> 3)
#define SET_DIRTY(dirty, pos, size) (*((BUFPTR)(dirty) + (((pos)->x + (pos)->y * CALC_ISOM_ROW((size)->cx)) >> 3)) |= (1 << ((pos)->x & 0x07)))
#define GET_DIRTY(dirty, pos, size) (*((BUFPTR)(dirty) + (((pos)->x + (pos)->y * CALC_ISOM_ROW((size)->cx)) >> 3)) & (1 << ((pos)->x & 0x07)))

// TODO:
#define M_CENTER CENTER_FLAG
#define M_DIFFUSE(n) (DIFFUSE_FLAG | (n))
#define M_CLIFF(n) (CLIFF_FLAG | (n))
#define M_SIDE(n) (SIDE_FLAG | (n))

/************************************************************************/

/* lL tL rH bH */
#define LLHH_PARAM                                                   \
    {                                                                \
        {LOW, LOW, HIGH, HIGH},                         /* order */  \
            {AS_LOW, AS_EDGE, AS_EDGE, AS_EDGE},        /* type */   \
            {M_CENTER, M_CENTER, M_SIDE(3), M_SIDE(3)}, /* x_abut */ \
            {M_CENTER, M_SIDE(3)},                      /* y_abut */ \
    }

/* lH tL rL bH */
#define HLLH_PARAM                                                   \
    {                                                                \
        {HIGH, LOW, LOW, HIGH},                         /* order */  \
            {AS_EDGE, AS_LOW, AS_EDGE, AS_EDGE},        /* type */   \
            {M_CENTER, M_CENTER, M_SIDE(1), M_SIDE(1)}, /* x_abut */ \
            {M_SIDE(1), M_CENTER},                      /* y_abut */ \
    }

/* lH tH rL bL */
#define HHLL_PARAM                                                       \
    {                                                                    \
        {HIGH, HIGH, LOW, LOW},                             /* order */  \
            {AS_EDGE, AS_EDGE, M_CLIFF(AS_LOW), AS_EDGE},   /* type */   \
            {M_SIDE(4), M_SIDE(4), M_CLIFF(0), M_CLIFF(0)}, /* x_abut */ \
            {M_SIDE(4), M_CLIFF(0)},                        /* y_abut */ \
    }

/* lL tH rH bL */
#define LHHL_PARAM                                                       \
    {                                                                    \
        {LOW, HIGH, HIGH, LOW},                             /* order */  \
            {AS_EDGE, AS_EDGE, AS_EDGE, M_CLIFF(AS_LOW)},   /* type */   \
            {M_SIDE(2), M_SIDE(2), M_CLIFF(1), M_CLIFF(1)}, /* x_abut */ \
            {M_CLIFF(1), M_SIDE(2)},                        /* y_abut */ \
    }

/* lL tL rL bH */
#define LLLH_PARAM                                                   \
    {                                                                \
        {LOW, LOW, LOW, HIGH},                          /* order */  \
            {AS_LOW, AS_LOW, AS_EDGE, AS_EDGE},         /* type */   \
            {M_CENTER, M_CENTER, M_SIDE(1), M_SIDE(3)}, /* x_abut */ \
            {M_CENTER, M_CENTER},                       /* y_abut */ \
    }

/* lH tL rL bL */
#define HLLL_PARAM                                                   \
    {                                                                \
        {HIGH, LOW, LOW, LOW},                          /* order */  \
            {AS_EDGE, AS_LOW, AS_LOW, AS_EDGE},         /* type */   \
            {M_CENTER, M_CENTER, M_CENTER, M_CLIFF(3)}, /* x_abut */ \
            {M_SIDE(6), M_CENTER},                      /* y_abut */ \
    }

/* lL tH rL bL */
#define LHLL_PARAM                                                             \
    {                                                                          \
        {LOW, HIGH, LOW, LOW},                                    /* order */  \
            {AS_EDGE, AS_EDGE, M_CLIFF(AS_LOW), M_CLIFF(AS_LOW)}, /* type */   \
            {M_SIDE(2), M_SIDE(4), M_CLIFF(0), M_CLIFF(1)},       /* x_abut */ \
            {M_CLIFF(1), M_CLIFF(0)},                             /* y_abut */ \
    }

/* lL tL rH bL */
#define LLHL_PARAM                                                   \
    {                                                                \
        {LOW, LOW, HIGH, LOW},                          /* order */  \
            {AS_LOW, AS_EDGE, AS_EDGE, AS_LOW},         /* type */   \
            {M_CENTER, M_CENTER, M_CLIFF(2), M_CENTER}, /* x_abut */ \
            {M_CENTER, M_SIDE(5)},                      /* y_abut */ \
    }

/* lL tH rH bH */
#define LHHH_PARAM                                                                   \
    {                                                                                \
        {LOW, HIGH, HIGH, HIGH},                                        /* order */  \
            {AS_EDGE, M_DIFFUSE(AS_HIGH), M_DIFFUSE(AS_HIGH), AS_EDGE}, /* type */   \
            {M_SIDE(2), M_DIFFUSE(8), M_DIFFUSE(8), M_SIDE(3)},         /* x_abut */ \
            {M_CLIFF(1), M_DIFFUSE(8)},                                 /* y_abut */ \
    }

/* lH tH rL bH */
#define HHLH_PARAM                                                                   \
    {                                                                                \
        {HIGH, HIGH, LOW, HIGH},                                        /* order */  \
            {M_DIFFUSE(AS_HIGH), AS_EDGE, AS_EDGE, M_DIFFUSE(AS_HIGH)}, /* type */   \
            {M_DIFFUSE(7), M_SIDE(4), M_SIDE(1), M_DIFFUSE(7)},         /* x_abut */ \
            {M_DIFFUSE(7), M_CLIFF(0)},                                 /* y_abut */ \
    }

/* lH tL rH bH */
#define HLHH_PARAM                                                   \
    {                                                                \
        {HIGH, LOW, HIGH, HIGH},                        /* order */  \
            {AS_EDGE, AS_EDGE, AS_EDGE, AS_EDGE},       /* type */   \
            {M_CENTER, M_CENTER, M_SIDE(3), M_SIDE(1)}, /* x_abut */ \
            {M_SIDE(1), M_SIDE(3)},                     /* y_abut */ \
    }

/* lH tH rH bL */
#define HHHL_PARAM                                                       \
    {                                                                    \
        {HIGH, HIGH, HIGH, LOW},                            /* order */  \
            {AS_EDGE, AS_EDGE, AS_EDGE, AS_EDGE},           /* type */   \
            {M_SIDE(4), M_SIDE(2), M_CLIFF(1), M_CLIFF(0)}, /* x_abut */ \
            {M_SIDE(4), M_SIDE(2)},                         /* y_abut */ \
    }

/* lL tH rL bH */
#define LHLH_PARAM                                                     \
    {                                                                  \
        {LOW, HIGH, LOW, HIGH},                           /* order */  \
            {AS_EDGE, AS_EDGE, AS_EDGE, AS_EDGE},         /* type */   \
            {M_SIDE(2), M_SIDE(4), M_SIDE(1), M_SIDE(3)}, /* x_abut */ \
            {M_CLIFF(1), M_CLIFF(0)},                     /* y_abut */ \
    }

/* lH tL rH bL */
#define HLHL_PARAM                                                     \
    {                                                                  \
        {HIGH, LOW, HIGH, LOW},                           /* order */  \
            {AS_EDGE, AS_EDGE, AS_EDGE, AS_EDGE},         /* type */   \
            {M_CENTER, M_CENTER, M_CLIFF(2), M_CLIFF(3)}, /* x_abut */ \
            {M_SIDE(6), M_SIDE(5)},                       /* y_abut */ \
    }

/* L_ERA_BADLANDS */
#define BADLANDS_PARAM                                                                                  \
    {                                                                                                   \
        0x0d, /* edge_start */                                                                          \
            {                                                                                           \
                /* center */                                                                            \
                {0x01, 0x02, 0x01, S_NONE},    /* 0:dirt					L_BRUSH_BADLANDS_DIRT */                   \
                {0x09, 0x04, 0x0f, S_NONE},    /* 1:mud					L_BRUSH_BADLANDS_MUD */                     \
                {0x02, 0x03, 0x04, S_NONE},    /* 2:high-dirt				L_BRUSH_BADLANDS_HIGH_DIRT */          \
                {0x03, 0x05, 0x05, S_NONE},    /* 3:water					L_BRUSH_BADLANDS_WATER */                 \
                {0x04, 0x06, 0x02, S_NONE},    /* 4:grass					L_BRUSH_BADLANDS_GRASS */                 \
                {0x07, 0x07, 0x03, S_NONE},    /* 5:high-grass				L_BRUSH_BADLANDS_HIGH_GRASS */        \
                {0x08, 0x12, 0x0e, S_MATTED},  /* 6:structure				L_BRUSH_BADLANDS_STRUCTURE */          \
                {0x05, 0x0e, 0x0a, S_TILE},    /* 7:asphalt				L_BRUSH_BADLANDS_ASPHALT */              \
                {0x06, 0x0f, 0x0b, S_DIFFUSE}, /* 8:rocky-ground			L_BRUSH_BADLANDS_ROCKY_GROUND */     \
            },                                                                                          \
            {                                                                                           \
                /* edge */                                                                              \
                {0x01, 0x02, FALSE, 0x22, {0x1e, 0x1f, 0x20, 0x21}}, /* 0:0D-1A dirt/high-dirt */       \
                {0x03, 0x01, FALSE, 0x23, {0x22, 0x23, 0x24, 0x25}}, /* 1:1B-28 water/dirt */           \
                {0x01, 0x04, FALSE, 0x14, {0x00, 0x00, 0x00, 0x00}}, /* 2:29-36 dirt/grass */           \
                {0x01, 0x06, FALSE, 0x1c, {0x00, 0x00, 0x00, 0x00}}, /* 3:37-44 dirt/rocky-ground */    \
                {0x02, 0x07, FALSE, 0x15, {0x00, 0x00, 0x00, 0x00}}, /* 4:45-52 high-dirt/high-grass */ \
                {0x01, 0x05, FALSE, 0x1b, {0x00, 0x00, 0x00, 0x00}}, /* 5:53-60 dirt/asphalt */         \
                {0x05, 0x08, FALSE, 0x1f, {0x1a, 0x1b, 0x1c, 0x1d}}, /* 6:61-6E asphalt/structure */    \
                {0x01, 0x09, FALSE, 0x16, {0x00, 0x00, 0x00, 0x00}}, /* 7:6F-7C dirt/mud */             \
            },                                                                                          \
    }

/* L_ERA_PLATFORM */
#define PLATFORM_PARAM                                                                                        \
    {                                                                                                         \
        0x18, /* edge_start */                                                                                \
            {                                                                                                 \
                /* center */                                                                                  \
                {0x01, 0x02, 0x01, S_NONE},   /* 0:space					L_BRUSH_PLATFORM_SPACE */                        \
                {0x09, 0x08, 0x0d, S_MATTED}, /* 1:low-platform			L_BRUSH_PLATFORM_LOW_PLATFORM */            \
                {0x0a, 0x09, 0x12, S_MATTED}, /* 2:rusty-pit				L_BRUSH_PLATFORM_RUSTY_PIT */                 \
                {0x02, 0x03, 0x02, S_NONE},   /* 3:platform				L_BRUSH_PLATFORM_PLATFORM */                   \
                {0x0e, 0x0b, 0x07, S_TILE},   /* 4:dark-platform			L_BRUSH_PLATFORM_DARK_PLATFORM */          \
                {0x0b, 0x04, 0x03, S_TILE},   /* 5:plating				L_BRUSH_PLATFORM_PLATING */                     \
                {0x08, 0x07, 0x06, S_TILE},   /* 6:solar-array			L_BRUSH_PLATFORM_SOLAR_ARRAY */              \
                {0x04, 0x05, 0x04, S_NONE},   /* 7:high-platform			L_BRUSH_PLATFORM_HIGH_PLATFORM */          \
                {0x0c, 0x06, 0x05, S_TILE},   /* 8:high-plating			L_BRUSH_PLATFORM_HIGH_PLATING */            \
                {0x0d, 0x0a, 0x08, S_MATTED}, /* 9:elevated-catwalk		L_BRUSH_PLATFORM_ELEVATED_CATWALK */     \
            },                                                                                                \
            {                                                                                                 \
                /* edge */                                                                                    \
                {0x01, 0x02, FALSE, 0x14, {0x17, 0x18, 0x19, 0x1a}}, /* 0:18-25 space/platform */             \
                {0x02, 0x04, FALSE, 0x15, {0x1b, 0x1c, 0x1d, 0x1e}}, /* 1:26-33 platform/high-platform */     \
                {0x02, 0x08, FALSE, 0x10, {0x00, 0x00, 0x00, 0x00}}, /* 2:34-41 platform/solar-array */       \
                {0x02, 0x09, TRUE, 0x11, {0x0e, 0x0f, 0x10, 0x11}},  /* 3:42-4F low-platform/platform */      \
                {0x02, 0x0a, TRUE, 0x12, {0x13, 0x14, 0x15, 0x16}},  /* 4:50-5D rusty-pit/platform */         \
                {0x02, 0x0b, FALSE, 0x0e, {0x00, 0x00, 0x00, 0x00}}, /* 5:5E-6B platform/plating */           \
                {0x04, 0x0c, FALSE, 0x0f, {0x00, 0x00, 0x00, 0x00}}, /* 6:6C-79 high-platform/high-plating */ \
                {0x02, 0x0d, FALSE, 0x13, {0x09, 0x0a, 0x0b, 0x0c}}, /* 7:7A-87 platform/elevated-catwalk */  \
                {0x02, 0x0e, FALSE, 0x0d, {0x00, 0x00, 0x00, 0x00}}, /* 8:88-95 platform/dark-platform */     \
            },                                                                                                \
    }

/* L_ERA_INSTALL */
#define INSTALL_PARAM                                                                                                \
    {                                                                                                                \
        0x16, /* edge_start */                                                                                       \
            {                                                                                                        \
                /* center */                                                                                         \
                {0x01, 0x02, 0x01, S_STEP}, /* 0:substructure			L_BRUSH_INSTALL_SUBSTRUCTURE */                      \
                {0x02, 0x03, 0x02, S_STEP}, /* 1:floor					L_BRUSH_INSTALL_FLOOR */                                  \
                {0x03, 0x06, 0x03, S_ROOF}, /* 2:roof					L_BRUSH_INSTALL_ROOF */                                    \
                {0x04, 0x04, 0x04, S_TILE}, /* 3:substructure-plating	L_BRUSH_INSTALL_SUBSTRUCTURE_PLATING */        \
                {0x05, 0x05, 0x05, S_TILE}, /* 4:plating				L_BRUSH_INSTALL_PLATING */                               \
                {0x06, 0x08, 0x07, S_TILE}, /* 5:substructure-panels	L_BRUSH_INSTALL_SUBSTRUCTURE_PANELS */          \
                {0x07, 0x07, 0x06, S_NONE}, /* 6:bottomless-pit			L_BRUSH_INSTALL_BOTTOMLESS_PIT */                  \
            },                                                                                                       \
            {                                                                                                        \
                /* edge */                                                                                           \
                {0x01, 0x02, FALSE, 0x0c, {0x08, 0x09, 0x0a, 0x0b}}, /* 0:16-23 substructure/floor */                \
                {0x02, 0x03, FALSE, 0x0d, {0x0c, 0x0d, 0x0e, 0x0f}}, /* 1:24-31 floor/roof */                        \
                {0x01, 0x04, FALSE, 0x0a, {0x00, 0x00, 0x00, 0x00}}, /* 2:32-3F substructure/substructure-plating */ \
                {0x02, 0x05, FALSE, 0x0b, {0x00, 0x00, 0x00, 0x00}}, /* 3:40-4D floor/plating */                     \
                {0x01, 0x06, FALSE, 0x0e, {0x00, 0x00, 0x00, 0x00}}, /* 4:4E-5B substructure/substructure-panels */  \
                {0x07, 0x01, FALSE, 0x0f, {0x10, 0x11, 0x12, 0x13}}, /* 5:5C-69 bottomless-pit/substructure */       \
            },                                                                                                       \
    }

/* L_ERA_ASHWORLD */
#define ASHWORLD_PARAM                                                                                  \
    {                                                                                                   \
        0x1b, /* edge_start */                                                                          \
            {                                                                                           \
                /* center */                                                                            \
                {0x01, 0x08, 0x07, S_NONE},    /* 0:magma					L_BRUSH_ASHWORLD_MAGMA */                 \
                {0x02, 0x02, 0x01, S_NONE},    /* 1:dirt					L_BRUSH_ASHWORLD_DIRT */                   \
                {0x03, 0x03, 0x02, S_TILE},    /* 2:lava					L_BRUSH_ASHWORLD_LAVA */                   \
                {0x04, 0x06, 0x05, S_DIFFUSE}, /* 3:shale					L_BRUSH_ASHWORLD_SHALE */                 \
                {0x08, 0x09, 0x08, S_TILE},    /* 4:broken-rock			L_BRUSH_ASHWORLD_BROKEN_ROCK */       \
                {0x05, 0x04, 0x03, S_NONE},    /* 5:high-dirt				L_BRUSH_ASHWORLD_HIGH_DIRT */          \
                {0x06, 0x05, 0x04, S_TILE},    /* 6:high-lava				L_BRUSH_ASHWORLD_HIGH_LAVA */          \
                {0x07, 0x07, 0x06, S_DIFFUSE}, /* 7:high-shale				L_BRUSH_ASHWORLD_HIGH_SHALE */        \
            },                                                                                          \
            {                                                                                           \
                /* edge */                                                                              \
                {0x01, 0x02, FALSE, 0x11, {0x09, 0x0a, 0x0b, 0x0c}}, /* 0:1B-28 magma/dirt */           \
                {0x02, 0x05, FALSE, 0x10, {0x0d, 0x0e, 0x0f, 0x10}}, /* 1:29-36 dirt/high-dirt */       \
                {0x02, 0x03, FALSE, 0x0b, {0x00, 0x00, 0x00, 0x00}}, /* 2:37-44 dirt/lava */            \
                {0x05, 0x06, FALSE, 0x0c, {0x00, 0x00, 0x00, 0x00}}, /* 3:45-52 high-dirt/high-lava */  \
                {0x02, 0x04, FALSE, 0x0d, {0x00, 0x00, 0x00, 0x00}}, /* 4:53-60 dirt/shale */           \
                {0x05, 0x07, FALSE, 0x0e, {0x00, 0x00, 0x00, 0x00}}, /* 5:61-6E high-dirt/high-shale */ \
                {0x02, 0x08, FALSE, 0x0f, {0x00, 0x00, 0x00, 0x00}}, /* 6:6F-7C dirt/broken-rock */     \
            },                                                                                          \
    }

/* L_ERA_JUNGLE */
#define JUNGLE_PARAM                                                                                              \
    {                                                                                                             \
        0x11, /* edge_start */                                                                                    \
            {                                                                                                     \
                /* center */                                                                                      \
                {0x03, 0x05, 0x05, S_NONE},    /* 0:water					L_BRUSH_JUNGLE_WATER */                             \
                {0x01, 0x02, 0x01, S_NONE},    /* 1:dirt					L_BRUSH_JUNGLE_DIRT */                               \
                {0x0d, 0x04, 0x0f, S_NONE},    /* 2:mud					L_BRUSH_JUNGLE_MUD */                                 \
                {0x04, 0x08, 0x08, S_NONE},    /* 3:jungle					L_BRUSH_JUNGLE_JUNGLE */                           \
                {0x06, 0x0f, 0x0b, S_DIFFUSE}, /* 4:rocky-ground			L_BRUSH_JUNGLE_ROCKY_GROUND */                 \
                {0x07, 0x0b, 0x06, S_DIFFUSE}, /* 5:ruins					L_BRUSH_JUNGLE_RUINS */                             \
                {0x05, 0x09, 0x0c, S_DIFFUSE}, /* 6:raised-jungle			L_BRUSH_JUNGLE_RAISED_JUNGLE */               \
                {0x08, 0x10, 0x10, S_MATTED},  /* 7:temple					L_BRUSH_JUNGLE_TEMPLE */                           \
                {0x02, 0x03, 0x04, S_NONE},    /* 8:high-dirt				L_BRUSH_JUNGLE_HIGH_DIRT */                      \
                {0x09, 0x0a, 0x09, S_NONE},    /* 9:high-jungle			L_BRUSH_JUNGLE_HIGH_JUNGLE */                   \
                {0x0a, 0x0c, 0x07, S_DIFFUSE}, /* a:high-ruins				L_BRUSH_JUNGLE_HIGH_RUINS */                    \
                {0x0b, 0x0d, 0x0d, S_DIFFUSE}, /* b:high-raised-jungle		L_BRUSH_JUNGLE_HIGH_RAISED_JUNGLE */      \
                {0x0c, 0x11, 0x11, S_MATTED},  /* c:high-temple			L_BRUSH_JUNGLE_HIGH_TEMPLE */                   \
            },                                                                                                    \
            {                                                                                                     \
                /* edge */                                                                                        \
                {0x01, 0x02, FALSE, 0x22, {0x1e, 0x1f, 0x20, 0x21}}, /* 0:11-1E dirt/high-dirt */                 \
                {0x03, 0x01, FALSE, 0x23, {0x22, 0x23, 0x24, 0x25}}, /* 1:1F-2C water/dirt */                     \
                {0x01, 0x04, FALSE, 0x17, {0x00, 0x00, 0x00, 0x00}}, /* 2:2D-3A dirt/jungle */                    \
                {0x01, 0x06, FALSE, 0x1c, {0x00, 0x00, 0x00, 0x00}}, /* 3:3B-48 dirt/rocky-ground */              \
                {0x04, 0x05, FALSE, 0x1d, {0x00, 0x00, 0x00, 0x00}}, /* 4:49-56 jungle/raised jungle */           \
                {0x04, 0x07, FALSE, 0x19, {0x00, 0x00, 0x00, 0x00}}, /* 5:57-64 jungle/ruins */                   \
                {0x04, 0x08, FALSE, 0x20, {0x12, 0x13, 0x14, 0x15}}, /* 6:65-72 jungle/temple */                  \
                {0x02, 0x09, FALSE, 0x18, {0x00, 0x00, 0x00, 0x00}}, /* 7:73-80 high-dirt/high-jungle */          \
                {0x09, 0x0a, FALSE, 0x1a, {0x00, 0x00, 0x00, 0x00}}, /* 8:81-8E high-jungle/high-ruins */         \
                {0x09, 0x0b, FALSE, 0x1e, {0x00, 0x00, 0x00, 0x00}}, /* 9:8F-9C high-jungle/high-raised-jungle */ \
                {0x09, 0x0c, FALSE, 0x21, {0x16, 0x17, 0x18, 0x19}}, /* a:9D-AA high-jungle/high-temple */        \
                {0x01, 0x0d, FALSE, 0x16, {0x00, 0x00, 0x00, 0x00}}, /* b:AB-B8 dirt/mud */                       \
            },                                                                                                    \
    }

/* L_ERA_DESERT */
#define DESERT_PARAM                                                                                                     \
    {                                                                                                                    \
        0x11, /* edge_start */                                                                                           \
            {                                                                                                            \
                /* center */                                                                                             \
                {0x03, 0x05, 0x05, S_NONE},    /* 0:tar					L_BRUSH_DESERT_TAR */                                        \
                {0x01, 0x02, 0x01, S_NONE},    /* 1:dirt					L_BRUSH_DESERT_DIRT */                                      \
                {0x0d, 0x04, 0x0f, S_NONE},    /* 2:dried-mud				L_BRUSH_DESERT_DRIED_MUD */                             \
                {0x04, 0x08, 0x08, S_NONE},    /* 3:sand-dunes				L_BRUSH_DESERT_SAND_DUNES */                           \
                {0x06, 0x0f, 0x0b, S_DIFFUSE}, /* 4:rocky-ground			L_BRUSH_DESERT_ROCKY_GROUND */                        \
                {0x07, 0x0b, 0x06, S_DIFFUSE}, /* 5:crags					L_BRUSH_DESERT_CRAGS */                                    \
                {0x05, 0x09, 0x0c, S_DIFFUSE}, /* 6:sandy-sunken-pit		L_BRUSH_DESERT_SANDY_SUNKEN_PIT */                 \
                {0x08, 0x10, 0x10, S_MATTED},  /* 7:compound				L_BRUSH_DESERT_COMPOUND */                               \
                {0x02, 0x03, 0x04, S_NONE},    /* 8:high-dirt				L_BRUSH_DESERT_HIGH_DIRT */                             \
                {0x09, 0x0a, 0x09, S_NONE},    /* 9:high-sand-dunes		L_BRUSH_DESERT_HIGH_SAND_DUNES */                   \
                {0x0a, 0x0c, 0x07, S_DIFFUSE}, /* a:high-crags				L_BRUSH_DESERT_HIGH_CRAGS */                           \
                {0x0b, 0x0d, 0x0d, S_DIFFUSE}, /* b:high-sandy-sunken-pit	L_BRUSH_DESERT_HIGH_SANDY_SUNKEN_PIT */        \
                {0x0c, 0x11, 0x11, S_MATTED},  /* c:high-compound			L_BRUSH_DESERT_HIGH_COMPOUND */                      \
            },                                                                                                           \
            {                                                                                                            \
                /* edge */                                                                                               \
                {0x01, 0x02, FALSE, 0x22, {0x1e, 0x1f, 0x20, 0x21}}, /* 0:11-1E dirt/high-dirt */                        \
                {0x03, 0x01, FALSE, 0x23, {0x22, 0x23, 0x24, 0x25}}, /* 1:1F-2C tar/dirt */                              \
                {0x01, 0x04, FALSE, 0x17, {0x00, 0x00, 0x00, 0x00}}, /* 2:2D-3A dirt/sand-dunes */                       \
                {0x01, 0x06, FALSE, 0x1c, {0x00, 0x00, 0x00, 0x00}}, /* 3:3B-48 dirt/rocky-ground */                     \
                {0x04, 0x05, FALSE, 0x1d, {0x00, 0x00, 0x00, 0x00}}, /* 4:49-56 sand-dunes/sandy-sunken-pit */           \
                {0x04, 0x07, FALSE, 0x19, {0x00, 0x00, 0x00, 0x00}}, /* 5:57-64 sand-dunes/crags */                      \
                {0x04, 0x08, FALSE, 0x20, {0x12, 0x13, 0x14, 0x15}}, /* 6:65-72 sand-dunes/compound */                   \
                {0x02, 0x09, FALSE, 0x18, {0x00, 0x00, 0x00, 0x00}}, /* 7:73-80 high-dirt/high-sand-dunes */             \
                {0x09, 0x0a, FALSE, 0x1a, {0x00, 0x00, 0x00, 0x00}}, /* 8:81-8E high-sand-dunes/high-crags */            \
                {0x09, 0x0b, FALSE, 0x1e, {0x00, 0x00, 0x00, 0x00}}, /* 9:8F-9C high-sand-dunes/high-sandy-sunken-pit */ \
                {0x09, 0x0c, FALSE, 0x21, {0x16, 0x17, 0x18, 0x19}}, /* a:9D-AA high-sand-dunes/high-compound */         \
                {0x01, 0x0d, FALSE, 0x16, {0x00, 0x00, 0x00, 0x00}}, /* b:AB-B8 dirt/dried-mud */                        \
            },                                                                                                           \
    }

/* L_ERA_ICE */
#define ICE_PARAM                                                                                         \
    {                                                                                                     \
        0x11, /* edge_start */                                                                            \
            {                                                                                             \
                /* center */                                                                              \
                {0x03, 0x05, 0x05, S_NONE},    /* 0:ice					L_BRUSH_ICE_ICE */                            \
                {0x01, 0x02, 0x01, S_NONE},    /* 1:snow					L_BRUSH_ICE_SNOW */                          \
                {0x0d, 0x04, 0x0f, S_NONE},    /* 2:moguls					L_BRUSH_ICE_MOGULS */                      \
                {0x04, 0x08, 0x08, S_NONE},    /* 3:dirt					L_BRUSH_ICE_DIRT */                          \
                {0x06, 0x0f, 0x0b, S_DIFFUSE}, /* 4:rocky-snow				L_BRUSH_ICE_ROCKY_SNOW */               \
                {0x07, 0x0b, 0x06, S_DIFFUSE}, /* 5:grass					L_BRUSH_ICE_GRASS */                        \
                {0x05, 0x09, 0x0c, S_DIFFUSE}, /* 6:water					L_BRUSH_ICE_WATER */                        \
                {0x08, 0x10, 0x10, S_MATTED},  /* 7:outpost				L_BRUSH_ICE_OUTPOST */                     \
                {0x02, 0x03, 0x04, S_NONE},    /* 8:high-snow				L_BRUSH_ICE_HIGH_SNOW */                 \
                {0x09, 0x0a, 0x09, S_NONE},    /* 9:high-dirt				L_BRUSH_ICE_HIGH_DIRT */                 \
                {0x0a, 0x0c, 0x07, S_DIFFUSE}, /* a:high-grass				L_BRUSH_ICE_HIGH_GRASS */               \
                {0x0b, 0x0d, 0x0d, S_DIFFUSE}, /* b:high-water				L_BRUSH_ICE_HIGH_WATER */               \
                {0x0c, 0x11, 0x11, S_MATTED},  /* c:high-outpost			L_BRUSH_ICE_HIGH_OUTPOST */            \
            },                                                                                            \
            {                                                                                             \
                /* edge */                                                                                \
                {0x01, 0x02, FALSE, 0x22, {0x1e, 0x1f, 0x20, 0x21}}, /* 0:11-1E snow/high-snow */         \
                {0x03, 0x01, FALSE, 0x23, {0x22, 0x23, 0x24, 0x25}}, /* 1:1F-2C ice/snow */               \
                {0x01, 0x04, FALSE, 0x17, {0x00, 0x00, 0x00, 0x00}}, /* 2:2D-3A snow/dirt */              \
                {0x01, 0x06, FALSE, 0x1c, {0x00, 0x00, 0x00, 0x00}}, /* 3:3B-48 snow/rocky-snow */        \
                {0x04, 0x05, FALSE, 0x1d, {0x00, 0x00, 0x00, 0x00}}, /* 4:49-56 dirt/water */             \
                {0x04, 0x07, FALSE, 0x19, {0x00, 0x00, 0x00, 0x00}}, /* 5:57-64 dirt/grass */             \
                {0x04, 0x08, FALSE, 0x20, {0x12, 0x13, 0x14, 0x15}}, /* 6:65-72 dirt/outpost */           \
                {0x02, 0x09, FALSE, 0x18, {0x00, 0x00, 0x00, 0x00}}, /* 7:73-80 high-snow/high-dirt */    \
                {0x09, 0x0a, FALSE, 0x1a, {0x00, 0x00, 0x00, 0x00}}, /* 8:81-8E high-dirt/high-grass */   \
                {0x09, 0x0b, FALSE, 0x1e, {0x00, 0x00, 0x00, 0x00}}, /* 9:8F-9C high-dirt/high-water */   \
                {0x09, 0x0c, FALSE, 0x21, {0x16, 0x17, 0x18, 0x19}}, /* a:9D-AA high-dirt/high-outpost */ \
                {0x01, 0x0d, FALSE, 0x16, {0x00, 0x00, 0x00, 0x00}}, /* b:AB-B8 snow/moguls */            \
            },                                                                                            \
    }

/* L_ERA_TWILIGHT */
#define TWILIGHT_PARAM                                                                                                  \
    {                                                                                                                   \
        0x11, /* edge_start */                                                                                          \
            {                                                                                                           \
                /* center */                                                                                            \
                {0x03, 0x05, 0x05, S_NONE},    /* 0:water					L_BRUSH_TWLIGHT_WATER */                                  \
                {0x01, 0x02, 0x01, S_NONE},    /* 1:dirt					L_BRUSH_TWLIGHT_DIRT */                                    \
                {0x0d, 0x04, 0x0f, S_NONE},    /* 2:mud					L_BRUSH_TWLIGHT_MUD */                                      \
                {0x04, 0x08, 0x08, S_NONE},    /* 3:crushed-rock			L_BRUSH_TWLIGHT_CRUSHED_ROCK */                      \
                {0x06, 0x0f, 0x0b, S_DIFFUSE}, /* 4:crevices				L_BRUSH_TWLIGHT_CREVICES */                             \
                {0x07, 0x0b, 0x06, S_DIFFUSE}, /* 5:flagstones				L_BRUSH_TWLIGHT_FLAGSTONES */                         \
                {0x05, 0x09, 0x0c, S_DIFFUSE}, /* 6:sunken-ground			L_BRUSH_TWLIGHT_SUNKEN_GROUND */                    \
                {0x08, 0x10, 0x10, S_MATTED},  /* 7:basilica				L_BRUSH_TWLIGHT_BASILICA */                             \
                {0x02, 0x03, 0x04, S_NONE},    /* 8:high-dirt				L_BRUSH_TWLIGHT_HIGH_DIRT */                           \
                {0x09, 0x0a, 0x09, S_NONE},    /* 9:high-crushed-rock		L_BRUSH_TWLIGHT_HIGH_CRUSHED_ROCK */             \
                {0x0a, 0x0c, 0x07, S_DIFFUSE}, /* a:high-flagstones		L_BRUSH_TWLIGHT_HIGH_FLAGSTONES */                 \
                {0x0b, 0x0d, 0x0d, S_DIFFUSE}, /* b:high-sunken-ground		L_BRUSH_TWLIGHT_HIGH_SUNKEN_GROUND */           \
                {0x0c, 0x11, 0x11, S_MATTED},  /* c:high-basilica			L_BRUSH_TWLIGHT_HIGH_BASILICA */                    \
            },                                                                                                          \
            {                                                                                                           \
                /* edge */                                                                                              \
                {0x01, 0x02, FALSE, 0x22, {0x1e, 0x1f, 0x20, 0x21}}, /* 0:11-1E dirt/high-dirt */                       \
                {0x03, 0x01, FALSE, 0x23, {0x22, 0x23, 0x24, 0x25}}, /* 1:1F-2C water/dirt */                           \
                {0x01, 0x04, FALSE, 0x17, {0x00, 0x00, 0x00, 0x00}}, /* 2:2D-3A dirt/crushed-rock */                    \
                {0x01, 0x06, FALSE, 0x1c, {0x00, 0x00, 0x00, 0x00}}, /* 3:3B-48 dirt/crevices */                        \
                {0x04, 0x05, FALSE, 0x1d, {0x00, 0x00, 0x00, 0x00}}, /* 4:49-56 crushed-rock/raised crushed-rock */     \
                {0x04, 0x07, FALSE, 0x19, {0x00, 0x00, 0x00, 0x00}}, /* 5:57-64 crushed-rock/flagstones */              \
                {0x04, 0x08, FALSE, 0x20, {0x12, 0x13, 0x14, 0x15}}, /* 6:65-72 crushed-rock/basilica */                \
                {0x02, 0x09, FALSE, 0x18, {0x00, 0x00, 0x00, 0x00}}, /* 7:73-80 high-dirt/high-crushed-rock */          \
                {0x09, 0x0a, FALSE, 0x1a, {0x00, 0x00, 0x00, 0x00}}, /* 8:81-8E high-crushed-rock/high-flagstones */    \
                {0x09, 0x0b, FALSE, 0x1e, {0x00, 0x00, 0x00, 0x00}}, /* 9:8F-9C high-crushed-rock/high-sunken-ground */ \
                {0x09, 0x0c, FALSE, 0x21, {0x16, 0x17, 0x18, 0x19}}, /* a:9D-AA high-crushed-rock/high-basilica */      \
                {0x01, 0x0d, FALSE, 0x16, {0x00, 0x00, 0x00, 0x00}}, /* b:AB-B8 dirt/mud */                             \
            },                                                                                                          \
    }

/************************************************************************/

enum ORDER
{
    LOW,
    HIGH
};
enum SIDE
{
    LEFT_SIDE,
    RIGHT_SIDE,
    SIDE_NUM
};
enum DIR
{
    LEFT,
    TOP,
    RIGHT,
    BOTTOM,
    DIR_NUM
};
enum FROM
{
    LEFT_TOP,
    TOP_RIGHT,
    RIGHT_BOTTOM,
    BOTTOM_LEFT,
    FROM_NUM
};

/* Type enumeration of central terrain */
enum CENTER_STYLE
{
    S_NONE,    /* Non-special terrain */
    S_MATTED,  /* Padded terrain */
    S_DIFFUSE, /* Diffuse terrain */
    S_TILE,    /* Tiled terrain */
    S_STEP,    /* Stepped terrain */
    S_ROOF,    /* Roof topography */
};

/* TILE Type mapping method enumeration */
enum TYPE_MAP
{
    AS_EDGE, /* Same as the TILE type of the edge itself */
    AS_LOW,  /* Same as the TILE type of low-level terrain */
    AS_HIGH, /* Same as the TILE type of high-rise terrain */
};

/************************************************************************/

/* Edge shape related parameter structure */
struct SHAPE_PARAM
{
    INT order[DIR_NUM];   /* The heights of the four corner diamonds */
    INT type[FROM_NUM];   /* TILE type information corresponding to each of the 4 corner diamonds */
    INT x_abut[FROM_NUM]; /* Horizontal adjacency information on the X axis */
                          /* The index correspondence is: */
                          /*	LEFT_TOP		Diamond-shaped RIGHT */
                          /*	TOP_RIGHT		Diamond-shaped LEFT */
                          /*	RIGHT_BOTTOM	Diamond-shaped LEFT */
                          /*	BOTTOM_LEFT		Diamond-shaped RIGHT */
    INT y_abut[SIDE_NUM]; /* Horizontal adjacency information on the Y axis */
                          /* The index correspondence is:： */
                          /*	LEFT_SIDE		BOTTOM in the upper left diamond shape and TOP in the lower left diamond shape */
                          /*	RIGHT_SIDE		BOTTOM in the upper right diamond shape and TOP in the lower right diamond shape */
};

/* ERA related parameter structure */
struct ERA_PARAM
{
    WORD edge_start; /* Starting ISOM value of the edge */
                     /* From the beginning, each consecutive SHAPE_NUM is a group, corresponding to an edge array member */
    struct
    {
        WORD isom;        /* Corresponding ISOM value */
        WORD type;        /* Corresponding TILE type */
        WORD abut;        /* Horizontal adjacency ID */
        WORD style;       /* Central terrain type */
    } center[MAX_CENTER]; /* Central terrain parameters */
    struct
    {
        WORD low;              /* ISOM value of low-level terrain */
        WORD high;             /* ISOM value of high-rise terrain */
        BOOL upend;            /* Whether to reverse the up-down relationship when generating ISOM value */
                               /* Only Low Platform and Rusty Pit in Platform have this feature */
        WORD type;             /* Edge transition TILE type */
        WORD cliff[CLIFF_NUM]; /* Cliff level adjacency relationship ID (only valid for cliff edge) */
    } edge[MAX_EDGE];          /* Edge terrain parameters */
};

/* ERA related information, generated by ERA_PARAM during initialization */
struct ERA_INFO
{
    BOOL init_flag;      /* Initialization flag */
    INT center_num;      /* Number of central terrain (number of effective members in the center array) */
    INT edge_num;        /* Edge terrain number (the number of effective members in the edge array) */
    INT max_center_type; /* Maximum central terrain type */
    struct
    {
        INT below;                /* Index of terrain that can be connected below */
        INT below_edge;           /* Index of the edge formed by the connection below */
        INT above_num;            /* The number of terrain that can be connected above (the number of effective members above and above_edge) */
        INT above[MAX_LINK];      /* An array of terrain indexes that can be connected above */
        INT above_edge[MAX_LINK]; /* An array of indexes of the edges formed by the upper connection */
    } center[MAX_CENTER];         /* Central terrain information */
    struct
    {
        INT low;                       /* Terrain index for low-level terrain */
        INT high;                      /* Terrain index for high-level terrain */
        BOOL cliff;                    /* Whether the cliff edge */
        INT shape[SHAPE_NUM][DIR_NUM]; /* The terrain index of each corner diamond of each edge shape */
    } edge[MAX_EDGE];                  /* Edge terrain information */
};

/* ISOM diamond mapping TILE information structure */
struct TILE_MAP
{
    WORD type[FROM_NUM];   /* The 4 corners of the ISOM diamond, the tile type of the diamond */
    WORD x_abut[FROM_NUM]; /* The (horizontal) adjacent ID on the X axis of the 4 corners of the ISOM diamond */
    WORD y_abut[FROM_NUM]; /* The (horizontal) adjacent IDs on the Y-axis of the 4 corners of the ISOM diamond */
    WORD z_abut[FROM_NUM]; /* The (vertical) adjacent IDs on the Z axis of the 4 corners of the ISOM diamond */
    WORD proj[SIDE_NUM];   /* The vertical adjacency ID of the cliff terrain projected onto the TILE diamond below */
};

/* Coordinate information queue node structure */
struct POS_QUENE
{
    POINT pos;              /* Coordinate information */
    struct POS_QUENE *next; /* Next node in the queue */
};

/************************************************************************/

/* Position value of even diamond（left, top, right, bottom顺序） */
static CONST WORD TILE_POS_EVEN[DIR_NUM] = {0x8, 0xa, 0x0, 0x2};

/* Position value of odd diamond（left, top, right, bottom顺序） */
static CONST WORD TILE_POS_ODD[DIR_NUM] = {0x4, 0xc, 0xe, 0x6};

/* 14 edge combination shapes */
static CONST struct SHAPE_PARAM SHAPE_TABLE[SHAPE_NUM] = {
    LLHH_PARAM,
    HLLH_PARAM,
    HHLL_PARAM,
    LHHL_PARAM,
    LLLH_PARAM,
    HLLL_PARAM,
    LHLL_PARAM,
    LLHL_PARAM,
    LHHH_PARAM,
    HHLH_PARAM,
    HLHH_PARAM,
    HHHL_PARAM,
    LHLH_PARAM,
    HLHL_PARAM,
};

/* ISOM parameter table of each ERA */
static CONST struct ERA_PARAM PARAM_TABLE[L_ERA_NUM] = {
    BADLANDS_PARAM,
    PLATFORM_PARAM,
    INSTALL_PARAM,
    ASHWORLD_PARAM,
    JUNGLE_PARAM,
    DESERT_PARAM,
    ICE_PARAM,
    TWILIGHT_PARAM,
};

/* Global variable */
static BOOL g_InitFlag;
static UINT g_TileDictNum[L_ERA_NUM];
static ISOM_DICT *g_TileDict[L_ERA_NUM];
static struct ERA_INFO g_EraInfo[L_ERA_NUM];
static INT g_Isom2Center[L_ERA_NUM][MAX_CENTER_ISOM];
static INT g_Shape2Index[MAX_SHAPE_ID];
static struct POS_QUENE g_PosQueneHead;
static struct POS_QUENE *g_PosQueneTail;

/************************************************************************/

/* Public function */
static BOOL validate_iso_map(CONST ISOM_MAP *map, BOOL create);
static BOOL check_pos(CONST ISOM_MAP *map, CONST POINT *pos);
static VOID calc_corner_pos(INT from, CONST POINT *base, POINT *corner);
static VOID calc_link_pos(INT from, CONST POINT *base, POINT *link);
static WORD get_center_isom(INT era, INT center);
static WORD get_edge_isom(INT era, INT edge, INT shape);
static INT isom_to_center(INT era, WORD isom);
static BOOL isom_to_edge_shape(INT era, WORD isom, INT *edge, INT *shape);
static INT shape_to_index(INT left, INT top, INT right, INT bottom);

/* ISOM value generation related function */
static BOOL isometric_brush(ISOM_MAP *map, INT brush, CONST POINT *pos);
static WORD isometric_link(ISOM_MAP *map, WORD isom, INT from, CONST POINT *pos);
static BOOL update_isom(ISOM_MAP *map, WORD isom, INT from, CONST POINT *pos);
static BOOL set_tile_pos(ISOM_MAP *map, CONST POINT *pos);
static BOOL get_isom_shape(INT era, WORD isom, INT *low, INT *high, INT *shape_info);
static WORD match_shape(INT era, CONST INT *shape_info);
static INT search_brush_link(INT era, INT brush_from, INT brush_to);

/* TILE mapping related functions */
static BOOL make_tile_map(CONST ISOM_MAP *map, CONST POINT *pos, ISOM_TILE *tile);
static VOID adjust_dirty_map(CONST ISOM_MAP *map, CONST POINT *pos, CONST ISOM_TILE *isom);
static VOID update_tile(CONST ISOM_MAP *map, CONST POINT *pos, CONST ISOM_TILE *isom);
static VOID map_isom_tile(CONST ISOM_MAP *map, CONST struct TILE_MAP *tile_map, CONST POINT *pos, ISOM_TILE *tile);
static CONST ISOM_DICT *lookup_tile(INT era, CONST ISOM_TILE *tile);
static INT gen_mega_tile_index(INT era, INT map_cx, INT y, CONST ISOM_DICT *dict, CONST ISOM_TILE *isom, LTILECPTR tile);
static WORD map_edge_tile_type(INT era, INT low, INT high, INT edge, INT temp);
static WORD map_edge_hor_abuttal(INT era, INT low, INT high, INT edge, INT temp, WORD *proj);
static WORD map_edge_ver_abuttal(INT era, INT low, INT high, INT edge, INT temp);
static VOID project_abuttal(CONST ISOM_MAP *map, ISOM_TILE *tile, INT from, WORD proj, CONST POINT *pos);

/* Coordinate information queue operation related functions */
static BOOL init_pos_quene(CONST POINT *pos);
static VOID exit_pos_quene(VOID);
static BOOL push_pos_quene(CONST POINT *pos);
static BOOL pop_pos_quene(VOID);
static CONST POINT *peek_pos_quene(VOID);
static BOOL is_pos_quene_empty(VOID);

/************************************************************************/

BOOL init_iso_map(VOID)
{
    INT i, shape;
    CONST INT *order;

    /* If initialized, do nothing */
    if (g_InitFlag)
        return TRUE;

    /* First fill in the shape index mapping table with invalid values */
    DMemSet(g_Shape2Index, -1, sizeof(g_Shape2Index));

    /* Initialize the shape index mapping table to find the corresponding edge shape index from the specific shape */
    for (i = 0; i < SHAPE_NUM; i++)
    {
        order = SHAPE_TABLE[i].order;
        shape = MAKE_SHAPE_ID(order[LEFT], order[TOP], order[RIGHT], order[BOTTOM]);
        DAssert(DBetween(shape, 0, MAX_SHAPE_ID));
        g_Shape2Index[shape] = i;
    }

    /* Set initialization flag */
    g_InitFlag = TRUE;
    return TRUE;
}

VOID exit_iso_map(VOID)
{
    /* Do nothing if it has not been initialized */
    if (!g_InitFlag)
        return;

    /* Clear initialization flag */
    g_InitFlag = FALSE;

    /* Clear global variables */
    DVarClr(g_TileDictNum);
    DVarClr(g_TileDict);
    DVarClr(g_EraInfo);
    DVarClr(g_Isom2Center);
    DVarClr(g_Shape2Index);
}

BOOL init_iso_era(INT era, CONST ISOM_DICT *tile_dict, UINT tile_num)
{
    INT center, edge, shape, low, high;
    UINT size;
    WORD isom;
    ISOM_DICT *dict;
    struct ERA_INFO *info;
    CONST struct ERA_PARAM *param;

    /* Fail if the global is still not initialized */
    if (!g_InitFlag)
        return FALSE;

    /* Parameter validity check */
    if (!DBetween(era, 0, L_ERA_NUM) || !tile_dict || !tile_num)
        return FALSE;

    /* If the specified ERA is initialized, nothing is needed */
    if (g_EraInfo[era].init_flag)
        return TRUE;

    DAssert(!g_TileDictNum[era] && !g_TileDict[era]);

    /* Create a TILE dictionary */
    /* Memory allocation */
    size = tile_num * sizeof(ISOM_DICT);
    dict = DAlloc(size);
    if (!dict)
        return FALSE;

    /* Dictionary content setting */
    DMemCpy(dict, tile_dict, size);
    g_TileDict[era] = dict;
    g_TileDictNum[era] = tile_num;

    /* Initialize ERA information with ERA parameters */
    param = &PARAM_TABLE[era];
    info = &g_EraInfo[era];

    /* Counter reset */
    info->center_num = 0;
    info->edge_num = 0;

    /* Initialize the contents of the ISOM value to the lookup table of the central terrain type to invalid values */
    DMemSet(&g_Isom2Center[era], -1, sizeof(g_Isom2Center[era]));

    /* Initialize central terrain information */
    for (center = 0; center < MAX_CENTER; center++)
    {
        info->center[center].above_num = 0;
        info->center[center].below = -1;
        info->center[center].below_edge = -1;
        DMemSet(info->center[center].above, -1, sizeof(info->center[center].above));
        DMemSet(info->center[center].above_edge, -1, sizeof(info->center[center].above_edge));
    }

    /* Establish various lookup tables to the central terrain cyclically, and count the number of central terrain types at the same time */
    for (center = 0; center < MAX_CENTER; center++)
    {

        /* 0 means end */
        isom = param->center[center].isom;
        if (!isom)
            break;

        /* Statistical Processing of Maximum Central Terrain Type */
        if (param->center[center].type > info->max_center_type)
            info->max_center_type = param->center[center].type;

        DAssert(isom < MAX_CENTER_ISOM);

        /* Fill the ISOM value to the lookup table of the central terrain type */
        g_Isom2Center[era][isom] = center;

        /* Accumulate the central terrain type count */
        info->center_num++;
    }

    /* Generate edge shape information cyclically and obtain the number of edges at the same time */
    for (edge = 0; edge < MAX_EDGE; edge++)
    {

        /* 0 means end */
        if (!param->edge[edge].low || !param->edge[edge].high)
            break;

        DAssert(param->edge[edge].low < MAX_CENTER_ISOM);
        DAssert(param->edge[edge].high < MAX_CENTER_ISOM);

        /* Determine terrain index for low-level terrain and high-level terrain */
        low = g_Isom2Center[era][param->edge[edge].low];
        high = g_Isom2Center[era][param->edge[edge].high];

        DAssert(low >= 0 && high >= 0);

        /* If you need to reverse the up-down relationship, reverse it here */
        if (param->edge[edge].upend)
            DSwap(low, high);

        /* Fill in the terrain index value of the upper and lower layers*/
        info->edge[edge].low = low;
        info->edge[edge].high = high;

        /* Determine whether the cliff edge */
        info->edge[edge].cliff = param->edge[edge].cliff[0] ? TRUE : FALSE;

        /* Look up the table to generate the diamond terrain index information of each corner of the edge shape */
        for (shape = 0; shape < SHAPE_NUM; shape++)
        {
            info->edge[edge].shape[shape][LEFT] = SHAPE_TABLE[shape].order[LEFT] ? high : low;
            info->edge[edge].shape[shape][TOP] = SHAPE_TABLE[shape].order[TOP] ? high : low;
            info->edge[edge].shape[shape][RIGHT] = SHAPE_TABLE[shape].order[RIGHT] ? high : low;
            info->edge[edge].shape[shape][BOTTOM] = SHAPE_TABLE[shape].order[BOTTOM] ? high : low;
        }

        /* Accumulate edge terrain type count */
        info->edge_num++;
    }

    DAssert(info->center_num > 0 && info->edge_num > 0);

    /* Circulate the creation of brush information for the entire terrain */
    for (center = 0; center < info->center_num; center++)
    {

        /* 0 means end */
        isom = param->center[center].isom;
        if (!isom)
            break;

        /* Check each edge combination item by item */
        for (edge = 0; edge < info->edge_num; edge++)
        {

            /* If it is the connection above */
            if (param->edge[edge].low == isom)
            {

                DAssert(info->center[center].above_num <= MAX_LINK);
                DAssert(param->edge[edge].high < MAX_CENTER_ISOM);
                high = g_Isom2Center[era][param->edge[edge].high];
                DAssert(high >= 0);
                info->center[center].above[info->center[center].above_num] = high;
                info->center[center].above_edge[info->center[center].above_num] = edge;
                info->center[center].above_num++;

                continue;
            }

            /* If it is the connection below (at most one) */
            if (param->edge[edge].high == isom)
            {

                DAssert(param->edge[edge].low < MAX_CENTER_ISOM);
                low = g_Isom2Center[era][param->edge[edge].low];
                DAssert(low >= 0);
                info->center[center].below = low;
                info->center[center].below_edge = edge;

                continue;
            }
        }
    }

    /* Set initialization flag */
    info->init_flag = TRUE;
    return TRUE;
}

VOID exit_iso_era(INT era)
{
    /* Parameter validity check */
    if (!DBetween(era, 0, L_ERA_NUM))
        return;

    /* Do nothing if it is still not initialized */
    if (!g_EraInfo[era].init_flag)
        return;

    /* Clear the corresponding dictionary information */
    g_TileDictNum[era] = 0;
    DFree(g_TileDict[era]);
    g_TileDict[era] = NULL;

    /* Clear ERA related information */
    DVarClr(g_EraInfo[era]);
    DVarClr(g_Isom2Center[era]);
}

BOOL create_iso_map(ISOM_MAP *map, BOOL new_map)
{
    INT i, j, row, line, center;
    UINT size;
    WORD group, mega;
    VPTR dirty;
    LISOMPTR data;
    LTILEPTR tile;
    LISOMCOORD isom;
    ISOM_TILE index;
    CONST ISOM_DICT *dict;
    CONST struct ERA_PARAM *param;

    /* Fail if not initialized */
    if (!g_InitFlag)
        return FALSE;

    /* Parameter validity check */
    if (!validate_iso_map(map, TRUE))
        return FALSE;

    row = CALC_ISOM_ROW(map->size.cx);
    line = CALC_ISOM_LINE(map->size.cy);

    size = row * line * sizeof(LISOMTILE);
    data = DAlloc(size);
    if (!data)
        return FALSE;

    /* ISOM initialization */
    DMemClr(data, size);

    size = map->size.cx * map->size.cy * sizeof(LTILEIDX);
    tile = DAlloc(size);
    if (!tile)
    {
        DFree(data);
        return FALSE;
    }

    /* TILE initialization */
    DMemClr(tile, size);

    size = CALC_DIRTY_SIZE(&map->size);
    dirty = DAlloc(size);
    if (!dirty)
    {
        DFree(data);
        DFree(tile);
        return FALSE;
    }

    /* Dirty flag bitmap initialization */
    DMemClr(dirty, size);

    map->isom = data;
    map->tile = tile;
    map->dirty = dirty;

    /* That's it for initializing the structure instead of creating a new map */
    if (!new_map)
        return TRUE;

    param = &PARAM_TABLE[map->era];

    /* Fill structure settings */
    isom.pos = 0;
    isom.isom = get_center_isom(map->era, map->def);
    isom.unused = 0;

    /* Fill each ISOM diamond with initial value */
    for (i = 0; i < line; i++)
    {
        for (j = 0; j < row; j++, data++)
        {
            data->left = isom;
            data->top = isom;
            data->right = isom;
            data->bottom = isom;
        }
    }

    center = isom_to_center(map->era, isom.isom);

    index.type = param->center[center].type;
    index.left_abut = param->center[center].abut;
    index.top_abut = param->center[center].abut;
    index.right_abut = param->center[center].abut;
    index.bottom_abut = param->center[center].abut;
    index.up_abut = V_ABUT_NONE;
    index.down_abut = V_ABUT_NONE;

    dict = lookup_tile(map->era, &index);
    DAssert(dict && dict->group_no);

    /* Fill each TILE with the initial value */
    for (i = 0; i < map->size.cy; i++)
    {
        for (j = 0; j < map->size.cx; j += 2)
        {
            group = dict->group_no;
            mega = gen_mega_tile_index(map->era, map->size.cx, i, dict, &index, tile);
            tile->mega_index = mega;
            tile->group_no = group++;
            tile++;
            tile->mega_index = mega;
            tile->group_no = group;
            tile++;
        }
    }

    /* Successfully returned */
    return TRUE;
}

VOID destroy_iso_map(ISOM_MAP *map)
{
    if (!map)
        return;

    DFree(map->isom);
    map->isom = NULL;

    DFree(map->tile);
    map->tile = NULL;

    DFree(map->dirty);
    map->dirty = NULL;
}

BOOL brush_iso_map(ISOM_MAP *map, INT brush, CONST POINT *tile_pos)
{
    POINT pos;

    /* Fail if not initialized */
    if (!g_InitFlag)
        return FALSE;

    /* ISOM map parameter validity check */
    if (!validate_iso_map(map, FALSE))
        return FALSE;

    /* The brush index value is the central terrain and must be within the allowed value range */
    if (!DBetween(brush, 0, g_EraInfo[map->era].center_num))
        return FALSE;

    /* TILE coordinate parameter validity check */
    if (!tile_pos || tile_pos->x < 0 || tile_pos->y < 0)
        return FALSE;

    /*
		Adjust the TILE coordinate system to the ISOM diamond coordinate system.
		It should be noted that for a brush, its coordinates are the ISOM diamond coordinates of the center of the brush diamond.
		That is, the coordinates of the diamond on the lower right side among the 4 ISOM diamonds around the brush.
	*/
    pos.x = tile_pos->x / 2;
    pos.y = tile_pos->y;

    /* Out of bounds */
    if (pos.x >= CALC_ISOM_ROW(map->size.cx) || pos.y >= CALC_ISOM_LINE(map->size.cy))
        return FALSE;

    /* The diamond where the center of the brush is located must be an even diamond */
    if (pos.x % 2 ^ pos.y % 2)
        return FALSE;

    /* Isometric brush processing */
    return isometric_brush(map, brush, &pos);
}

BOOL update_iso_map(CONST ISOM_MAP *map)
{
#ifndef NDEBUG
    FILE *fp;
    LTILEPTR tile;
#endif
    INT row, line, size;
    POINT pos;
    ISOM_TILE *isom;

    /* Fail if not initialized */
    if (!g_InitFlag)
        return FALSE;

    /* Parameter validity check */
    if (!validate_iso_map(map, FALSE))
        return FALSE;

    /* ISOM row and column calculation */
    row = CALC_ISOM_ROW(map->size.cx);
    line = CALC_ISOM_LINE(map->size.cy);

    /* TILE mapping table memory allocation */
    size = line * row * sizeof(ISOM_TILE);
    isom = DAlloc(size);
    DMemClr(isom, size);

    /* First generate a rough TILE mapping table */
    for (pos.y = 0; pos.y < line; pos.y++)
    {
        for (pos.x = 0; pos.x < row; pos.x++)
            make_tile_map(map, &pos, isom);
    }

    /* Re-adjust the dirty flag bitmap according to the TILE mapping table */
    for (pos.y = 0; pos.y < line; pos.y++)
    {
        for (pos.x = 0; pos.x < row; pos.x++)
            adjust_dirty_map(map, &pos, isom);
    }

    /* Since random numbers will be used below, initialize here */
    DInitRand();

    /* Correct the TILE type of the mapping table generated above, and then check the table to find the actual corresponding TILE */
    for (pos.y = 0; pos.y < line; pos.y++)
    {
        for (pos.x = 0; pos.x < row; pos.x++)
            update_tile(map, &pos, isom);
    }

#ifndef NDEBUG
    tile = map->tile;
    fp = fopen("isom\\temp.cv5.txt", "w");
    if (fp)
    {
        for (pos.y = 0; pos.y < line; pos.y++)
        {
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t%02X\t\t", LOC_MAP_POS(isom, &pos, &map->size)->top_abut);
            fputc('\n', fp);
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "%02X\t%02X\t%02X\t",
                        LOC_MAP_POS(isom, &pos, &map->size)->left_abut,
                        LOC_MAP_POS(isom, &pos, &map->size)->type,
                        LOC_MAP_POS(isom, &pos, &map->size)->right_abut);
            fputc('\n', fp);
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t%02X\t\t", LOC_MAP_POS(isom, &pos, &map->size)->bottom_abut);
            fputc('\n', fp);
        }
        fclose(fp);
    }
    fp = fopen("isom\\temp.isom.txt", "w");
    if (fp)
    {
        for (pos.y = 0; pos.y < line; pos.y++)
        {
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t%02X\t\t", LOC_MAP_POS(map->isom, &pos, &map->size)->top.isom);
            fputc('\n', fp);
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "%02X\t\t%02X\t",
                        LOC_MAP_POS(map->isom, &pos, &map->size)->left.isom,
                        LOC_MAP_POS(map->isom, &pos, &map->size)->right.isom);
            fputc('\n', fp);
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t%02X\t\t", LOC_MAP_POS(map->isom, &pos, &map->size)->bottom.isom);
            fputc('\n', fp);
        }
        fclose(fp);
    }
    fp = fopen("isom\\temp.tile.txt", "w");
    if (fp)
    {
        for (pos.y = 0; pos.y < line; pos.y++)
        {
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t\t\t");
            fputc('\n', fp);
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t%04X\t\t", tile[pos.y * map->size.cx + pos.x * 2].group_no);
            fputc('\n', fp);
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t\t\t");
            fputc('\n', fp);
        }
        fclose(fp);
    }
    fp = fopen("isom\\temp.cliff.txt", "w");
    if (fp)
    {
        for (pos.y = 0; pos.y < line; pos.y++)
        {
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t%d\t\t", LOC_MAP_POS(isom, &pos, &map->size)->up_abut);
            fputc('\n', fp);
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t\t\t");
            fputc('\n', fp);
            for (pos.x = 0; pos.x < row; pos.x++)
                fprintf(fp, "\t%d\t\t", LOC_MAP_POS(isom, &pos, &map->size)->down_abut);
            fputc('\n', fp);
        }
        fclose(fp);
    }
#endif

    DFree(isom);

    size = CALC_DIRTY_SIZE(&map->size);
    DMemClr(map->dirty, size);

    return TRUE;
}

/************************************************************************/

static BOOL validate_iso_map(CONST ISOM_MAP *map, BOOL create)
{
    INT row, line;

    if (!map || !DBetween(map->era, 0, L_ERA_NUM))
        return FALSE;

    if (map->size.cx < 0)
        return FALSE;

    if (map->size.cy < 0)
        return FALSE;

    row = CALC_ISOM_ROW(map->size.cx);
    line = CALC_ISOM_LINE(map->size.cy);

    if (create)
        return TRUE;

    if (!map->isom || !map->tile || !g_EraInfo[map->era].init_flag)
        return FALSE;

    if (!DBetween(map->def, 0, g_EraInfo[map->era].center_num))
        return FALSE;

    return TRUE;
}

static BOOL check_pos(CONST ISOM_MAP *map, CONST POINT *pos)
{
    DAssert(map && pos);

    if (!DBetween(pos->x, 0, CALC_ISOM_ROW(map->size.cx)))
        return FALSE;

    if (!DBetween(pos->y, 0, CALC_ISOM_LINE(map->size.cy)))
        return FALSE;

    return TRUE;
}

static VOID calc_corner_pos(INT from, CONST POINT *base, POINT *corner)
{
    DAssert(DBetween(from, 0, FROM_NUM) && base && corner);

    /*
		Calculate the coordinates of the rhombus in each position of the brush, and complete the following mapping:
			from			corner.x	corner.y
			LEFT_TOP		base.x - 1	base.y - 1
			TOP_RIGHT		base.x		base.y - 1
			RIGHT_BOTTOM	base.x		base.y
			BOTTOM_LEFT		base.x - 1	base.y
	*/
    corner->x = IS_FROM_DIR(from, LEFT) ? base->x - 1 : base->x;
    corner->y = IS_FROM_DIR(from, TOP) ? base->y - 1 : base->y;
}

static VOID calc_link_pos(INT from, CONST POINT *base, POINT *link)
{
    DAssert(DBetween(from, 0, FROM_NUM) && base && link);

    /*
		Calculate the center coordinates of the connected brushes and complete the following mapping:
			from			link.x		link.y
			LEFT_TOP		base.x - 1	base.y - 1
			TOP_RIGHT		base.x + 1	base.y - 1
			RIGHT_BOTTOM	base.x + 1	base.y + 1
			BOTTOM_LEFT		base.x - 1	base.y + 1
	*/
    link->x = IS_FROM_DIR(from, LEFT) ? base->x - 1 : base->x + 1;
    link->y = IS_FROM_DIR(from, TOP) ? base->y - 1 : base->y + 1;
}

static WORD get_center_isom(INT era, INT center)
{
    DAssert(DBetween(era, 0, L_ERA_NUM) && g_EraInfo[era].init_flag);
    DAssert(DBetween(center, 0, g_EraInfo[era].center_num));

    return PARAM_TABLE[era].center[center].isom;
}

static WORD get_edge_isom(INT era, INT edge, INT shape)
{
    DAssert(DBetween(era, 0, L_ERA_NUM) && g_EraInfo[era].init_flag);
    DAssert(DBetween(edge, 0, g_EraInfo[era].edge_num));
    DAssert(DBetween(shape, 0, SHAPE_NUM));

    return PARAM_TABLE[era].edge_start + edge * SHAPE_NUM + shape;
}

static INT isom_to_center(INT era, WORD isom)
{
    INT center;

    DAssert(DBetween(era, 0, L_ERA_NUM) && g_InitFlag);
    DAssert(g_EraInfo[era].init_flag);

    if (isom >= PARAM_TABLE[era].edge_start)
        return -1;

    if (isom >= MAX_CENTER_ISOM)
        return -1;

    center = g_Isom2Center[era][isom];
    if (center < 0)
        return -1;

    return center;
}

static BOOL isom_to_edge_shape(INT era, WORD isom, INT *edge, INT *shape)
{
    DAssert(edge && shape);
    DAssert(DBetween(era, 0, L_ERA_NUM) && g_InitFlag);
    DAssert(g_EraInfo[era].init_flag);

    *edge = -1;
    *shape = -1;

    if (isom < PARAM_TABLE[era].edge_start)
        return FALSE;

    *edge = (isom - PARAM_TABLE[era].edge_start) / SHAPE_NUM;
    if (*edge >= g_EraInfo[era].edge_num)
    {
        *edge = -1;
        return FALSE;
    }

    *shape = (isom - PARAM_TABLE[era].edge_start) % SHAPE_NUM;
    return TRUE;
}

static INT shape_to_index(INT left, INT top, INT right, INT bottom)
{
    INT shape;

    DAssert(g_InitFlag);

    shape = MAKE_SHAPE_ID(left, top, right, bottom);
    if (!DBetween(shape, 0, MAX_SHAPE_ID))
        return -1;

    return g_Shape2Index[shape];
}

static BOOL isometric_brush(ISOM_MAP *map, INT brush, CONST POINT *pos)
{
    INT from;
    WORD isom;
    POINT link_pos;
    WORD update;

    DAssert(map && pos);

    /* Location queue initialization */
    if (!init_pos_quene(pos))
        return FALSE;

    /* First get the ISOM value of the central terrain corresponding to the brush */
    isom = get_center_isom(map->era, brush);

    /* Update the ISOM value of the brush down position */
    for_each_from(from)
        update_isom(map, isom, from, pos);

    /* Breadth first */
    while (!is_pos_quene_empty())
    {

        /* Get the coordinates of the current leader */
        pos = peek_pos_quene();
        DAssert(pos);

        /* Get the current ISOM value */
        isom = LOC_MAP_POS(map->isom, pos, &map->size)->left.isom;
        DAssert(isom == LOC_MAP_POS(map->isom, pos, &map->size)->top.isom);

        // TODO:
        if (!isom)
            continue;

        /* Match the connected terrain in the four directions */
        for_each_from(from)
        {

            /* Connect terrain matching */
            update = isometric_link(map, isom, from, pos);
            if (!update)
                continue;

            /* Calculate the coordinates of the changed ISOM diamond and put it in the queue for processing */
            calc_link_pos(from, pos, &link_pos);
            if (!push_pos_quene(&link_pos))
            {
                exit_pos_quene();
                return FALSE;
            }
        }

        /* After processing the current coordinates of the head of the team, leave the team */
        DVerify(pop_pos_quene());
    }

    return TRUE;
}

static WORD isometric_link(ISOM_MAP *map, WORD isom, INT from, CONST POINT *pos)
{
    INT opp, low, high, link_low, link_high, brush1, brush2, brush3, brush4;
    WORD link, new_link;
    POINT corner, link_pos;
    LISOMPTR data;
    INT shape[DIR_NUM], link_shape[DIR_NUM];
    LISOMCOORD *tile;
    CONST struct ERA_PARAM *param;

    DAssert(map && pos && DBetween(from, 0, FROM_NUM));

    /* Map out of bounds check */
    if (!check_pos(map, pos))
        return 0;

    calc_corner_pos(from, pos, &corner);

    /* Map out of bounds check */
    if (!check_pos(map, &corner))
        return 0;

    data = LOC_MAP_POS(map->isom, &corner, &map->size);
    tile = (LISOMCOORD *)&data->left;

    /*
		Get the ISOM value of the connection object, the corresponding relationship is as follows:
			from			dir1		dir2
			LEFT_TOP		LEFT		TOP
			TOP_RIGHT		TOP			RIGHT
			RIGHT_BOTTOM	RIGHT		BOTTOM
			BOTTOM_LEFT		BOTTOM		LEFT
	*/
    link = tile[DIR1_OF_FROM(from)].isom;
    DAssert(tile[DIR2_OF_FROM(from)].isom);

    calc_link_pos(from, pos, &link_pos);

    /* Map out of bounds check */
    if (!check_pos(map, &link_pos))
        return 0;

    if (!get_isom_shape(map->era, isom, &low, &high, shape))
        return 0;

    // TODO: The ISOM value of the connection target may be 0 and needs to be processed!!
    if (!get_isom_shape(map->era, link, &link_low, &link_high, link_shape))
    {
        DAssert(FALSE);
        return 0;
    }

    param = &PARAM_TABLE[map->era];
    opp = OPPOSITE(from);

    /*
		The corresponding relationship here is:
			from			brush1	brush2	link_brush1	link_brush2	link_brush3	link_brush4
			LEFT_TOP		LEFT	TOP		BOTTOM		RIGHT		LEFT		TOP
			TOP_RIGHT		TOP		RIGHT	LEFT		BOTTOM		TOP			RIGHT
			RIGHT_BOTTOM	RIGHT	BOTTOM	TOP			LEFT		RIGHT		BOTTOM
			BOTTOM_LEFT		BOTTOM	LEFT	RIGHT		TOP			BOTTOM		LEFT
	*/
    brush1 = shape[DIR1_OF_FROM(from)];
    brush2 = shape[DIR2_OF_FROM(from)];

    /*
		For non-Matted terrain, if the terrain of the current boundary is consistent with the terrain that connects the target boundary, it is considered to be connectable and can be terminated without any conversion;
		But for Matted terrain, if there is a low-level terrain on the boundary, then the terrain inside the connecting target must also match it.
	*/

    /* First force the boundaries to be consistent */
    link_shape[DIR2_OF_FROM(opp)] = brush1;
    link_shape[DIR1_OF_FROM(opp)] = brush2;

    /* If the corrected connection shape is illegal, the core idea is to find two connectable brush terrains based on the existing shape information, and use these two brushes to fill in those incompatible rhombuses.*/

    /* Pay attention to the brush1-4 here, they are arranged in counterclockwise order, so the corresponding relationship is 1-4, 2-3. */
    brush3 = link_shape[DIR2_OF_FROM(from)];
    brush4 = link_shape[DIR1_OF_FROM(from)];

    /*
		If the two terrains of the boundary are the same, then brush1 (brush2) is selected first.
		Since brush3 and brush4 must be connectable, as long as the connection relationship is established from brush1 to any one of them,
		Select the terrain closest to brush1 on its connection chain as another terrain candidate, and fill the original brush3 and brush4.
	*/
    brush4 = search_brush_link(map->era, brush1, brush4);
    brush3 = search_brush_link(map->era, brush2, brush3);

    /* TODO: comment */
    if (brush1 != brush2)
    {
        if (brush4 != brush2)
            brush4 = brush1;
        if (brush3 != brush1)
            brush3 = brush2;
    }

    link_shape[DIR2_OF_FROM(from)] = brush3;
    link_shape[DIR1_OF_FROM(from)] = brush4;

    /*
		Matted terrain processing.
		First of all, the low-level and high-level terrain of the current brushed rhombus is the same meaning that it is not an edge, so Matted terrain processing must be unnecessary.
		If the upper layer of the current brush diamond is the Matted terrain, and the terrain on the side of the current brush near the connection direction is the lower terrain,
        It must be processed as follows
	*/
    if (low != high)
    {
        if (param->center[high].style == S_MATTED)
        {
            if (brush1 == low && link_shape[DIR1_OF_FROM(from)] != high)
                link_shape[DIR1_OF_FROM(from)] = low;
            if (brush2 == low && link_shape[DIR2_OF_FROM(from)] != high)
                link_shape[DIR2_OF_FROM(from)] = low;
        }
        else
        {
            brush4 = link_shape[DIR1_OF_FROM(from)];
            brush3 = link_shape[DIR2_OF_FROM(from)];
            if (param->center[brush1].style != S_MATTED && param->center[brush4].style == S_MATTED && shape[DIR2_OF_FROM(opp)] != brush4)
                link_shape[DIR1_OF_FROM(from)] = brush1;
            if (param->center[brush2].style != S_MATTED && param->center[brush3].style == S_MATTED && shape[DIR1_OF_FROM(opp)] != brush3)
                link_shape[DIR2_OF_FROM(from)] = brush2;
        }
    }

    /*
		Special boundary treatment. The shape of the diamond beyond the border is forced to be the same as the shape of the nearest diamond in the expansion direction.
			from			x		x-equ		y		y-equ
			LEFT_TOP		LEFT	BOTTOM		TOP		RIGHT
			TOP_RIGHT		RIGHT	BOTTOM		TOP		LEFT
			RIGHT_BOTTOM	RIGHT	TOP			BOTTOM	LEFT
			BOTTOM_LEFT		LEFT	TOP			BOTTOM	RIGHT
	*/
    if (link_shape[DIR1_OF_FROM(opp)] != link_shape[DIR2_OF_FROM(opp)])
    {
        calc_corner_pos(from, &link_pos, &corner);
        if (!DBetween(corner.x, 0, CALC_ISOM_ROW(map->size.cx)))
            link_shape[X_DIR_OF_FROM(from)] = link_shape[Y_DIR_OF_FROM(opp)];
        if (!DBetween(corner.y, 0, CALC_ISOM_LINE(map->size.cy)))
            link_shape[Y_DIR_OF_FROM(from)] = link_shape[X_DIR_OF_FROM(opp)];
    }

    /* If the ISOM value corresponding to the corrected connection shape has not changed from before, do nothing */
    new_link = match_shape(map->era, link_shape);
    if (new_link == link)
        return 0;

    DAssert(new_link);

    /* If a new ISOM value is generated, the diamond is updated with it */
    for_each_from(from)
        update_isom(map, new_link, from, &link_pos);

    return new_link;
}

static BOOL update_isom(ISOM_MAP *map, WORD isom, INT from, CONST POINT *pos)
{
    INT opp;
    POINT corner;
    LISOMPTR data;
    LISOMCOORD *coord[DIR_NUM];

    DAssert(map && pos && DBetween(from, 0, FROM_NUM));

    /* Calculate the coordinates of the corner diamond in the specified direction */
    calc_corner_pos(from, pos, &corner);

    /* Set TILE diamond position */
    if (!set_tile_pos(map, &corner))
        return FALSE;

    data = LOC_MAP_POS(map->isom, &corner, &map->size);
    coord[LEFT] = &data->left;
    coord[TOP] = &data->top;
    coord[RIGHT] = &data->right;
    coord[BOTTOM] = &data->bottom;

    /* Mark TILE diamond as dirty */
    SET_DIRTY(map->dirty, &corner, &map->size);

    /* For the brush, it may be the upper left corner, but for the ISOM rhombus, it is indeed the lower right corner of the upper left rhombus, so first find the relative direction from	*/
    opp = OPPOSITE(from);

    /*
		Fill in the corresponding ISOM value, the corresponding relationship is as follows:
			from			opp				dir1	dir2
			LEFT_TOP		RIGHT_BOTTOM	RIGHT	BOTTOM
			TOP_RIGHT		BOTTOM_LEFT		BOTTOM	LEFT
			RIGHT_BOTTOM	LEFT_TOP		LEFT	TOP
			BOTTOM_LEFT		TOP_RIGHT		TOP		RIGHT
	*/
    coord[DIR1_OF_FROM(opp)]->isom = isom;
    coord[DIR2_OF_FROM(opp)]->isom = isom;

    return TRUE;
}

static BOOL set_tile_pos(ISOM_MAP *map, CONST POINT *pos)
{
    LISOMPTR data;
    CONST WORD *tile_pos;

    DAssert(map && pos);

    /* Out of bounds inspection */
    if (!check_pos(map, pos))
        return FALSE;

    /* Set position value according to parity */
    tile_pos = ((pos->x + pos->y) & 0x01) ? TILE_POS_EVEN : TILE_POS_ODD;

    data = LOC_MAP_POS(map->isom, pos, &map->size);
    data->left.pos = tile_pos[LEFT];
    data->top.pos = tile_pos[TOP];
    data->right.pos = tile_pos[RIGHT];
    data->bottom.pos = tile_pos[BOTTOM];

    return TRUE;
}

static BOOL get_isom_shape(INT era, WORD isom, INT *low, INT *high, INT *shape_info)
{
    INT center, edge, shape;
    struct ERA_INFO *info;
    CONST struct ERA_PARAM *param;

    DAssert(DBetween(era, 0, L_ERA_NUM) && low && high && shape_info);
    DAssert(g_InitFlag && g_EraInfo[era].init_flag);

    *low = -1;
    *high = -1;
    DMemSet(shape_info, -1, DIR_NUM * sizeof(INT));

    center = isom_to_center(era, isom);
    if (center >= 0)
    {
        *low = center;
        *high = center;
        shape_info[LEFT] = center;
        shape_info[TOP] = center;
        shape_info[RIGHT] = center;
        shape_info[BOTTOM] = center;
        return TRUE;
    }

    if (!isom_to_edge_shape(era, isom, &edge, &shape))
        return FALSE;

    param = &PARAM_TABLE[era];
    info = &g_EraInfo[era];

    /* Note that the connection processing requires high and low terrain that has not been processed by the up-down relationship inversion, so take it directly from the PARAM_TABLE */
    *low = isom_to_center(era, param->edge[edge].low);
    *high = isom_to_center(era, param->edge[edge].high);

    DMemCpy(shape_info, info->edge[edge].shape[shape], DIR_NUM * sizeof(INT));
    return TRUE;
}

static WORD match_shape(INT era, CONST INT *shape_info)
{
    INT brush1, brush2, edge, shape;
    CONST struct ERA_INFO *info;

    DAssert(DBetween(era, 0, L_ERA_NUM) && shape_info && g_EraInfo[era].init_flag);

    /* Statistical shape data, only two terrains are allowed at most */
    brush1 = brush2 = shape_info[LEFT];
    if (shape_info[TOP] != brush1)
        brush2 = shape_info[TOP];
    if (shape_info[RIGHT] != brush1 && shape_info[RIGHT] != brush2)
    {
        if (brush1 != brush2)
            return 0;
        brush2 = shape_info[RIGHT];
    }
    if (shape_info[BOTTOM] != brush1 && shape_info[BOTTOM] != brush2)
    {
        if (brush1 != brush2)
            return 0;
        brush2 = shape_info[BOTTOM];
    }

    info = &g_EraInfo[era];

    DAssert(DBetween(brush1, 0, info->center_num));
    DAssert(DBetween(brush2, 0, info->center_num));

    /* If the values ​​at all positions are the same, it indicates that the ISOM diamond is the central terrain */
    if (brush1 == brush2)
        return get_center_isom(era, brush1);

    /* If the two terrains are not connected, it is considered invalid */
    if (info->center[brush1].below == brush2)
        edge = info->center[brush1].below_edge;
    else if (info->center[brush2].below == brush1)
        edge = info->center[brush2].below_edge;
    else
        return 0;

    /* Look up the table to find the shape ID, and then get the ISOM value */
    for (shape = 0; shape < SHAPE_NUM; shape++)
    {
        if (!DMemCmp(shape_info, info->edge[edge].shape[shape], DIR_NUM * sizeof(INT)))
            return get_edge_isom(era, edge, shape);
    }

    /* A combination that does not exist? It's impossible to get here in theory */
    DAssert(FALSE);
    return 0;
}

static INT search_brush_link(INT era, INT brush_from, INT brush_to)
{
    INT center, next_brush;
    CONST struct ERA_INFO *info;

    DAssert(DBetween(era, 0, L_ERA_NUM) && g_EraInfo[era].init_flag);
    DAssert(DBetween(brush_from, 0, MAX_CENTER) && DBetween(brush_to, 0, MAX_CENTER));

    if (brush_from == brush_to)
        return brush_from;

    info = &g_EraInfo[era];

    /* Find from to all the way down until you find from */
    center = brush_to;

    while (info->center[center].below >= 0)
    {
        if (info->center[center].below == brush_from)
            return center;
        center = info->center[center].below;
    }

    /*
		If you can't find from down, then either from can find to down. At this time, the recent brush should be below from from;
		Either to cannot be found. Because of the tree structure, the connecting path between to and from must pass from below.
		So it should also be below from.
	*/
    next_brush = info->center[brush_from].below;
    DAssert(next_brush >= 0);
    return next_brush;
}

static BOOL make_tile_map(CONST ISOM_MAP *map, CONST POINT *pos, ISOM_TILE *tile)
{
    INT from, center, low, high, edge, shape, temp;
    WORD isom;
    LISOMCPTR data;
    struct TILE_MAP tile_map;
    CONST struct ERA_PARAM *param;
    CONST struct ERA_INFO *info;

    DAssert(map && pos && tile);

    /* Only handle even diamonds (the diamond where the center of the brush is) */
    if (pos->x % 2 ^ pos->y % 2)
        return FALSE;

    DVarClr(tile_map);

    param = &PARAM_TABLE[map->era];

    /*
		Get the ISOM value of the brush diamond at that position.
		Since the diamond at the center (bottom right diamond) must exist, here always take the value from the bottom right diamond
	*/
    data = LOC_MAP_POS(map->isom, pos, &map->size);
    isom = data->left.isom;
    DAssert(isom == data->top.isom);

    center = isom_to_center(map->era, isom);

    tile_map.proj[LEFT_SIDE] = V_ABUT_NONE;
    tile_map.proj[RIGHT_SIDE] = V_ABUT_NONE;

    /* Is it brushed terrain or edge terrain? */
    if (center >= 0)
    {

        /* The brush terrain directly fills the TILE boundary ID corresponding to the brush */
        for_each_from(from)
        {
            tile_map.type[from] = param->center[center].type;
            tile_map.x_abut[from] = param->center[center].abut;
            tile_map.y_abut[from] = param->center[center].abut;
            tile_map.z_abut[from] = V_ABUT_NONE;
        }
    }
    else
    {

        if (!isom_to_edge_shape(map->era, isom, &edge, &shape))
            return FALSE;

        info = &g_EraInfo[map->era];
        DAssert(info->init_flag);

        low = info->edge[edge].low;
        high = info->edge[edge].high;

        for_each_from(from)
        {

            temp = SHAPE_TABLE[shape].type[from];
            tile_map.type[from] = map_edge_tile_type(map->era, low, high, edge, temp);

            temp = SHAPE_TABLE[shape].x_abut[from];
            tile_map.x_abut[from] = map_edge_hor_abuttal(map->era, low, high, edge, temp, tile_map.proj);

            temp = SHAPE_TABLE[shape].y_abut[SIDE_OF_FROM(from)];
            tile_map.y_abut[from] = map_edge_hor_abuttal(map->era, low, high, edge, temp, tile_map.proj);

            temp = SHAPE_TABLE[shape].y_abut[SIDE_OF_FROM(from)];
            tile_map.z_abut[from] = map_edge_ver_abuttal(map->era, low, high, edge, temp);
        }
    }

    /* Fill in the TILE index corresponding to the brush diamond */
    map_isom_tile(map, &tile_map, pos, tile);

    return TRUE;
}

static VOID adjust_dirty_map(CONST ISOM_MAP *map, CONST POINT *pos, CONST ISOM_TILE *isom)
{
    POINT coord;

    DAssert(map && pos && isom);

    if (!GET_DIRTY(map->dirty, pos, &map->size))
        return;

    coord = *pos;
    while (LOC_MAP_POS(isom, &coord, &map->size)->up_abut && --coord.y >= 0)
        SET_DIRTY(map->dirty, &coord, &map->size);

    coord = *pos;
    while (LOC_MAP_POS(isom, &coord, &map->size)->down_abut && ++coord.y < CALC_ISOM_LINE(map->size.cy))
        SET_DIRTY(map->dirty, &coord, &map->size);
}

static VOID update_tile(CONST ISOM_MAP *map, CONST POINT *pos, CONST ISOM_TILE *isom)
{
    WORD group, mega;
    LTILEPTR tile;
    CONST ISOM_DICT *dict;

    DAssert(map && isom && pos);
    DAssert(DBetween(pos->x, 0, CALC_ISOM_ROW(map->size.cx)) && DBetween(pos->y, 0, CALC_ISOM_LINE(map->size.cy)));

    /* Not deal with out of bounds */
    if (pos->x * 2 >= map->size.cx || pos->y >= map->size.cy)
        return;

    /* Only handle dirty diamonds */
    if (!GET_DIRTY(map->dirty, pos, &map->size))
        return;

    isom = LOC_MAP_POS(isom, pos, &map->size);
    tile = map->tile + pos->x * 2 + map->size.cx * pos->y;

    /* Find the corresponding TILE group number */
    dict = lookup_tile(map->era, isom);

    if (!dict || !dict->group_no)
    {
        DAssert(FALSE);
        //		DMemClr(tile, 2 * sizeof(LISOMTILE));
        return;
    }

    /* Randomly generate MegaTile serial number */
    mega = gen_mega_tile_index(map->era, map->size.cx, pos->y, dict, isom, tile);

    group = dict->group_no;

    /* Fill an adjacent pair of odd and even diamonds at once */
    tile->mega_index = mega;
    tile->group_no = group;

    group++;
    tile++;

    tile->mega_index = mega;
    tile->group_no = group;
}

static VOID map_isom_tile(CONST ISOM_MAP *map, CONST struct TILE_MAP *tile_map, CONST POINT *pos, ISOM_TILE *tile)
{
    INT from, opp, max_center_type;
    POINT corner;
    WORD *h_abut;
    WORD *v_abut;
    ISOM_TILE *isom;

    DAssert(map && tile_map && pos && tile);
    DAssert(check_pos(map, pos));

    max_center_type = g_EraInfo[map->era].max_center_type;

    for_each_from(from)
    {

        calc_corner_pos(from, pos, &corner);

        /* Map out of bounds check */
        if (!check_pos(map, &corner))
            continue;

        isom = LOC_MAP_POS(tile, &corner, &map->size);

        /* If the source terrain is edge terrain, it will definitely cover the target, and if the target terrain is the central terrain, it must also be covered by the source terrain. */
        if (tile_map->type[from] > max_center_type || isom->type <= max_center_type)
            isom->type = tile_map->type[from];

        /*
			For the brush, it may be the upper left corner, but for the ISOM diamond, it is indeed the lower right corner of the upper left diamond.
            Therefore, first find the relative direction of from
		*/
        opp = OPPOSITE(from);

        h_abut = (WORD *)&isom->left_abut;

        /* Fill in the corresponding TILE boundary ID */
        h_abut[X_DIR_OF_FROM(opp)] = tile_map->x_abut[from];
        h_abut[Y_DIR_OF_FROM(opp)] = tile_map->y_abut[from];

        v_abut = (WORD *)&isom->up_abut;

        /*
			The corresponding relationship here is:
				from			v_abut	bool
				LEFT_TOP		DOWN	TRUE
				TOP_RIGHT		DOWN	TRUE
				RIGHT_BOTTOM	UP		FALSE
				BOTTOM_LEFT		UP		FALSE
		*/
        if (!v_abut[IS_FROM_DIR(from, TOP)])
            v_abut[IS_FROM_DIR(from, TOP)] = tile_map->z_abut[from];
    }

    /* ISOM diamond shape projection processing of adjacent corners in the lower left direction */
    project_abuttal(map, tile, BOTTOM_LEFT, tile_map->proj[LEFT_SIDE], pos);

    /* ISOM diamond shape projection processing for adjacent corners in the lower right direction*/
    project_abuttal(map, tile, RIGHT_BOTTOM, tile_map->proj[RIGHT_SIDE], pos);
}

static CONST ISOM_DICT *lookup_tile(INT era, CONST ISOM_TILE *tile)
{
    UINT i;
    CONST ISOM_DICT *dict;

    DAssert(DBetween(era, 0, L_ERA_NUM) && tile && g_InitFlag);
    DAssert(g_EraInfo[era].init_flag);
    DAssert(g_TileDictNum[era] && g_TileDict[era]);

    dict = g_TileDict[era];

    for (i = 0; i < g_TileDictNum[era]; i++, dict++)
    {
        if (!DMemCmp(tile, &dict->tile, sizeof(ISOM_TILE)))
            return dict;
    }

    return NULL;
}

static INT gen_mega_tile_index(INT era, INT map_cx, INT y, CONST ISOM_DICT *dict, CONST ISOM_TILE *isom, LTILECPTR tile)
{
    INT i, often_num, seldom_num;

    DAssert(DBetween(era, 0, L_ERA_NUM));
    DAssert(map_cx && y >= 0 && dict && isom && tile);

    DAssert((isom->up_abut == isom->up_abut) || !isom->up_abut || !isom->down_abut);

    /* If the ID of the first row or the upper-level adjacency relationship is 0, it must be random again */
    if (!y || !isom->up_abut)
    {

        /* No MegaTile available (such as Space), return zero */
        if (!dict->mega_mask)
            return 0;

        /* Generate a list of common MegaTiles and count the number */
        for (i = 0, often_num = 0; i < 16; i++)
        {
            if (!(dict->mega_mask & (1 << i)))
                break;
            often_num++;
        }

        /* Generate rare MegaTile list and count the number */
        for (i++, seldom_num = 0; i < 16; i++)
        {
            if (!(dict->mega_mask & (1 << i)))
                break;
            seldom_num++;
        }

        DAssert(often_num);

        /* Randomly a valid MegaTile index, the algorithm comes from staredit */
        if ((DRandom() % 100) >= 5 || !seldom_num)
            return DRandom() % often_num;

        return (DRandom() % seldom_num) + often_num + 1;
    }

    /* Otherwise, it is consistent with the MegaTile index in the same column of the previous row */
    tile -= map_cx;
    return tile->mega_index;
}

static WORD map_edge_tile_type(INT era, INT low, INT high, INT edge, INT temp)
{
    CONST struct ERA_PARAM *param;
    CONST struct ERA_INFO *info;

    DAssert(DBetween(era, 0, L_ERA_NUM));

    param = &PARAM_TABLE[era];
    info = &g_EraInfo[era];

    switch (temp & MAP_FLAG_MASK)
    {
    case CLIFF_FLAG:
        temp = info->edge[edge].cliff ? AS_EDGE : (temp & ~MAP_FLAG_MASK);
        break;
    case DIFFUSE_FLAG:
        temp = (param->center[high].style == S_DIFFUSE) ? (temp & ~MAP_FLAG_MASK) : AS_EDGE;
        break;
    }

    /* Edge terrain builds TILE boundary mapping information based on the template */
    switch (temp)
    {
    case AS_LOW:
        return param->center[low].type;
    case AS_HIGH:
        return param->center[high].type;
    default:
        return param->edge[edge].type;
    }
}

static WORD map_edge_hor_abuttal(INT era, INT low, INT high, INT edge, INT temp, WORD *proj)
{
    CONST struct ERA_PARAM *param;
    CONST struct ERA_INFO *info;

    DAssert(DBetween(era, 0, L_ERA_NUM) && proj);

    param = &PARAM_TABLE[era];
    info = &g_EraInfo[era];

    switch (temp & MAP_FLAG_MASK)
    {
    case CENTER_FLAG:
        return param->center[low].abut;
    case DIFFUSE_FLAG:
        if (param->center[high].style == S_DIFFUSE)
            return param->center[high].abut;
        return M_SIDE(temp & ~MAP_FLAG_MASK);
    case CLIFF_FLAG:
        DAssert(DBetween(temp & ~MAP_FLAG_MASK, 0, CLIFF_NUM));
        if (info->edge[edge].cliff)
        {
            if (param->center[high].style != S_TILE && (temp & ~CLIFF_FLAG) == 2)
                proj[RIGHT_SIDE] = V_ABUT_LEFT;
            else if (param->center[high].style != S_TILE && (temp & ~CLIFF_FLAG) == 3)
                proj[LEFT_SIDE] = V_ABUT_RIGHT;
            return param->edge[edge].cliff[temp & ~MAP_FLAG_MASK];
        }
        return param->center[low].abut;
    case SIDE_FLAG:
        return temp;
    }

    DAssert(FALSE);
    return 0;
}

static WORD map_edge_ver_abuttal(INT era, INT low, INT high, INT edge, INT temp)
{
    CONST struct ERA_PARAM *param;
    CONST struct ERA_INFO *info;

    DAssert(DBetween(era, 0, L_ERA_NUM));

    param = &PARAM_TABLE[era];
    info = &g_EraInfo[era];

    switch (temp & MAP_FLAG_MASK)
    {
    case CENTER_FLAG:
        temp = 0;
        break;
    case DIFFUSE_FLAG:
        if (param->center[high].style == S_DIFFUSE)
            temp = 0;
        else
            temp &= ~DIFFUSE_FLAG;
        break;
    case CLIFF_FLAG:
        if (info->edge[edge].cliff)
            return V_ABUT_CENTER;
        temp = 0;
        break;
    case SIDE_FLAG:
        temp &= ~SIDE_FLAG;
        break;
    default:
        DAssert(FALSE);
        temp = 0;
        break;
    }

    if (!temp)
        return V_ABUT_NONE;

    if (temp <= 4)
    {
        if ((param->center[high].style == S_STEP || param->center[high].style == S_ROOF) && temp % 2)
            return V_ABUT_NONE;
        return V_ABUT_CENTER;
    }

    if (param->center[high].style == S_ROOF && temp == 7)
        return V_ABUT_LEFT;

    if (param->center[high].style == S_ROOF && temp == 8)
        return V_ABUT_RIGHT;

    if (temp % 2)
        return (info->edge[edge].cliff || param->center[high].style == S_TILE) ? V_ABUT_NONE : V_ABUT_LEFT;

    return (info->edge[edge].cliff || param->center[high].style == S_TILE) ? V_ABUT_NONE : V_ABUT_RIGHT;
}

static VOID project_abuttal(CONST ISOM_MAP *map, ISOM_TILE *tile, INT from, WORD proj, CONST POINT *pos)
{
    POINT corner;
    ISOM_TILE *isom;

    calc_corner_pos(from, pos, &corner);

    /* Map out of bounds check */
    if (!check_pos(map, &corner))
        return;

    isom = LOC_MAP_POS(tile, &corner, &map->size);
    isom->down_abut = proj;

    corner.y++;

    /* Map out of bounds check */
    if (!check_pos(map, &corner))
        return;

    /* Fill the corresponding edge mode (above) */
    isom = LOC_MAP_POS(tile, &corner, &map->size);
    isom->up_abut = proj;
}

static BOOL init_pos_quene(CONST POINT *pos)
{
    struct POS_QUENE *node;

    DAssert(pos && g_InitFlag);

    node = DAlloc(sizeof(struct POS_QUENE));
    if (!node)
        return FALSE;

    node->pos = *pos;
    node->next = NULL;

    DVarClr(g_PosQueneHead.pos);
    g_PosQueneHead.next = node;
    g_PosQueneTail = node;
    return TRUE;
}

static VOID exit_pos_quene(VOID)
{
    struct POS_QUENE *node, *next;

    DAssert(g_InitFlag);

    node = g_PosQueneHead.next;
    while (node)
    {
        next = node->next;
        DFree(node);
        node = next;
    }
}

static BOOL push_pos_quene(CONST POINT *pos)
{
    struct POS_QUENE *node;

    DAssert(g_PosQueneTail && pos);

    node = DAlloc(sizeof(struct POS_QUENE));
    if (!node)
        return FALSE;

    node->pos = *pos;
    node->next = NULL;

    g_PosQueneTail->next = node;
    g_PosQueneTail = node;
    return TRUE;
}

static BOOL pop_pos_quene(VOID)
{
    struct POS_QUENE *node;

    DAssert(g_PosQueneTail);

    node = g_PosQueneHead.next;
    if (!node)
        return FALSE;

    if (g_PosQueneTail == node)
        g_PosQueneTail = &g_PosQueneHead;

    g_PosQueneHead.next = node->next;
    DFree(node);
    return TRUE;
}

static CONST POINT *peek_pos_quene(VOID)
{
    DAssert(g_PosQueneTail);

    if (!g_PosQueneHead.next)
        return NULL;

    return &g_PosQueneHead.next->pos;
}

static BOOL is_pos_quene_empty(VOID)
{
    DAssert(g_PosQueneTail);

    if (!g_PosQueneHead.next)
        return TRUE;

    return FALSE;
}

/************************************************************************/