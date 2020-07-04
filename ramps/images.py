import Image
import ImageDraw
# from PIL import Image, ImageDraw
import sys
import math
from os import listdir
from os.path import isfile, join

black = (0, 0, 0)
white = (255, 255, 255)
red = (255, 0, 0)
green = (0, 255, 0)
blue = (0, 0, 255)
cyan = (0, 255, 255)
magenta = (255, 0, 255)
yellow = (255, 255, 0)


def open_image(path):
    newImage = Image.open(path)
    return newImage


def save_image(image, path):
    image.save(path, 'png')


def create_image(i, j):
    image = Image.new("RGB", (i, j), "black")
    return image


def get_pixel(image, i, j):
    # Inside image bounds?
    width, height = image.size
    if i >= width or j >= height or i < 0 or j < 0:
        return None

    # Get Pixel
    pixel = image.getpixel((i, j))
    return pixel

# Create a Grayscale version of the image

# ltr htl


def find_edges(image):
    # Get size
    width, height = image.size

    # Create new Image and a Pixel Map
    new = create_image(width, height)
    pixels = new.load()

    for y in range(height):
        for x in range(width):
            # Get Pixel

            pixel = get_pixel(image, x, y)
            if (pixel == black):
                continue

            high_pixel = get_pixel(image, x-1, y)
            if (high_pixel > pixel):
                pixels[x, y] = red

        for x in range(width - 1, -1, -1):
            # Get Pixel
            pixel = get_pixel(image, x, y)
            if (pixel == black or not pixels[x, y] == black):
                continue

            high_pixel = get_pixel(image, min(width - 1, x+1), y)
            if (high_pixel > pixel):
                pixels[x, y] = green

    for x in range(width):
        for y in range(height):
            pixel = get_pixel(image, x, y)
            if (pixel == black or not pixels[x, y] == black):
                continue

            high_pixel = get_pixel(image, x, y-1)
            if (high_pixel > pixel):
                pixels[x, y] = blue

        for y in range(height - 1, -1, -1):
            pixel = get_pixel(image, x, y)
            if (pixel == black or not pixels[x, y] == black):
                continue

            high_pixel = get_pixel(image, x, min(height - 1, y+1))
            if (high_pixel > pixel):
                pixels[x, y] = cyan

    # Return new image
    return new


def create_ramps(image, original):
    width, height = image.size

    # Create new Image and a Pixel Map
    new = create_image(width, height)
    pixels = new.load()

    processedImage = create_image(width, height)
    processed = processedImage.load()

    def find_neighbours(pos):
        (x, y) = pos
        if x < 0 or y < 0 or x >= width or y >= height:
            return []
        # no feature or feature already processed
        if (get_pixel(image, x, y) == black or not processed[x, y] == black):
            return []

        processed[x, y] = white
        east = find_neighbours((x+1, y))
        south_east = find_neighbours((x+1, y+1))
        south = find_neighbours((x, y+1))
        south_west = find_neighbours((x-1, y+1))
        west = find_neighbours((x-1, y))
        north_west = find_neighbours((x-1, y-1))
        north = find_neighbours((x, y-1))
        north_east = find_neighbours((x+1, y-1))

        return east + south_east + south + south_west + west + north_west + north + north_east + [pos]

    for y in range(height):
        for x in range(width):
            processed[x, y] = black
            pixels[x, y] = get_pixel(original, x, y)

    ramps = []
    for y in range(height):
        for x in range(width):
            if processed[x, y] == black or not get_pixel(image, x, y) == black:
                neighbours = find_neighbours((x, y))
                if (len(neighbours) > 15):
                    print (neighbours)
                    ramps.append(neighbours)

    for ramp in ramps:
        for (x, y) in ramp:
            pixels[x, y] = get_pixel(image, x, y)

    return [new, ramps]


def draw_ramps(ramps, image):
    width, height = image.size

    # creating new Image object
    img = Image.new("RGB", (width, height))

    # create line image
    img1 = ImageDraw.Draw(img)

    for ramp in ramps:
        east = 0
        south = 0
        north = 0
        west = 0
        min_x = width
        min_y = height
        max_x = 0
        max_y = 0
        min_v = (width, height)
        max_v = (0, 0)
        for (x, y) in ramp:
            if x < min_x:
                min_x = x
            if y < min_y:
                min_y = y
            if x > max_x:
                max_x = x
            if y > max_y:
                max_y = y

            if (x, y) < min_v:
                min_v = (x, y)
            if (x, y) > max_v:
                max_v = (x, y)

            if get_pixel(image, x, y) == red:
                east = east + 1
            elif get_pixel(image, x, y) == green:
                west = west + 1
            elif get_pixel(image, x, y) == blue:
                south = south + 1
            elif get_pixel(image, x, y) == cyan:
                north = north + 1

        # img1.rectangle([min_x, min_y, max_x, max_y], black, white)
        w = max_x - min_x
        h = max_y - min_y
        l = math.sqrt(w * w + h * h)

        vec_x = east - west
        vec_y = south - north

        cx = (min_x + max_x)/2
        cy = (min_y + max_y)/2

        # method 1: sourcing max x y points independently blue/green axis
        img1.line([cx - vec_x//2, cy + vec_y//2,
                   cx + vec_x//2, cy-vec_y//2], blue)

        img1.line([cx - vec_x//2, cy - vec_y//2,
                   cx + vec_x//2, cy+vec_y//2], red)

        cx = (min_v[0] + max_v[0]) / 2
        cy = (min_v[1] + max_v[1]) / 2

        vec_x = max_v[0] - min_v[0]
        vec_y = max_v[1] - min_v[1]

        # method 2: sourcing max vectors cyan/magenta axis
        img1.line([cx - vec_x//2, cy + vec_y//2,
                   cx + vec_x//2, cy-vec_y//2], cyan)

        img1.line([cx - vec_x//2, cy - vec_y//2,
                   cx + vec_x//2, cy+vec_y//2], magenta)

    return img


def test_next_x(image, x, y, width, max_n):
    count = 1
    lastcolor = get_pixel(image, x, y)
    for i in range(x + 1, min(x + max_n, width)):
        pixel = get_pixel(image, i, y)
        if (pixel == lastcolor):
            count = count + 1
        else:
            break
    return count


def test_pattern(image, pixels, pattern, x, y, flipX=False):
    offset = 0
    if flipX:
        for j in range(len(pattern)):
            pattern[j] = pattern[j][::-1]
        offset = -len(pattern[0]) + 1

    def same_color(i, j, color):
        if x + i < 0:
            return False
        if y + j < 0:
            return False
        if y + j >= image.size[1]:
            return False
        if x + i >= image.size[0]:
            return False
        return pixels[x + i, y + j] == color

    h = len(pattern)
    w = len(pattern[0])

    for j in range(h):
        for i in range(w):
            if not same_color(i + offset, j, pattern[j][i]):
                return False

    return True


def test_and_draw_pattern(image, pixels, pattern, x, y, flipX, color):
    if test_pattern(image, pixels, pattern, x, y, flipX):
        offset = 0
        if flipX:
            offset = -len(pattern[0]) + 1
        draw_box(pixels, x + offset, y, len(pattern[0]), len(pattern), color)
        return -len(pattern[0]) + 1 if flipX else len(pattern[0])
    else:
        return 0


def test_fs_duck(image, pixels, x, y, hc, lc, flipX, color):
    pattern = [
        [lc, lc, hc, hc],
        [lc, lc, hc, hc],
        [lc, lc, lc, lc],
        [lc, lc, lc, lc],
    ]

    return test_and_draw_pattern(image, pixels, pattern, x, y, flipX, color)


def test_fs_longduck(image, pixels, x, y, hc, lc, flipX, color):
    pattern = [
        [lc, lc, hc, hc, hc, hc],
        [lc, lc, hc, hc, hc, hc],
        [lc, lc, lc, lc, lc, lc],
        [lc, lc, lc, lc, lc, lc],
    ]

    return test_and_draw_pattern(image, pixels, pattern, x, y, flipX, color)


def test_mp_axe(image, pixels, x, y, hc, lc, flipX, color):
    pattern = [
        [lc, lc, hc, hc, hc, hc, hc, hc, hc, hc, hc, hc, hc, hc],
        [lc, lc, hc, hc, hc, hc, hc, hc, hc, hc, hc, hc, hc, hc],
        [lc, lc, lc, lc, lc, lc, hc, hc, hc, hc, hc, hc, hc, hc],
        [lc, lc, lc, lc, lc, lc, hc, hc, hc, hc, hc, hc, hc, hc],
        [lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, hc, hc, hc, hc],
        [lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, hc, hc, hc, hc],
        [lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, lc],
        [lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, lc, lc],
    ]

    return test_and_draw_pattern(image, pixels, pattern, x, y, flipX, color)


def test_mp_hockey_rev(image, pixels, x, y, hc, lc, flipX, color):
    pattern = [
        [lc, lc, hc, hc]

    ]

    return test_and_draw_pattern(image, pixels, pattern, x, y, flipX, color)


def mix_image(a, b, ratio=0.5):
    width, height = a.size
    newImage = create_image(width, height)
    pixels = newImage.load()

    for x in range(width):
        for y in range(height):
            pixels[x, y] = mix(get_pixel(a, x, y), get_pixel(b, x, y))

    return newImage


def mix((r, g, b), (r2, g2, b2), ratio=0.5):
    return (int(r*ratio+r2*(1-ratio)), int(g*ratio+g2*(1-ratio)), int(b*ratio+b2*(1-ratio)))


def darken((r, g, b)):
    return (r/4, g/4, b/4)


def draw_box(pixels, x, y, width, height, color):
    for i in range(width):
        for j in range(height):
            (r, g, b) = pixels[x + i, y + j]
            (r2, g2, b2) = color
            # pixels[x + i, y + j] = ((r+r2)/2, (g+g2)/2, (b+b2)/2)
            pixels[x + i, y + j] = color


def fill_irregularities(image):
    # Get size
    width, height = image.size

    # Create new Image and a Pixel Map
    newImage = create_image(width, height)
    pixels = newImage.load()

    for y in range(height):
        for x in range(width):
            pixels[x, y] = get_pixel(image, x, y)

    # Transform to grayscale
    for y in range(height):
        for x in range(width):
            # Get Pixel
            pixel = pixels[x, y]
            if (pixel == black or pixel == green or pixel == magenta):
                continue

            high_pixel = pixels[max(0, x-1), y]

            if (high_pixel > pixel):
                out = test_mp_axe(newImage, pixels, x, y,
                                  high_pixel, pixel, False, high_pixel)
                out = test_fs_longduck(newImage, pixels, x, y,
                                       high_pixel, pixel, False, high_pixel)
                out = test_fs_duck(newImage, pixels, x, y, high_pixel,
                                   pixel, False, high_pixel)

        for x in range(width - 1, -1, -1):
            # Get Pixel
            pixel = pixels[x, y]
            if (pixel == black or pixel == green or pixel == magenta):
                continue

            high_pixel = pixels[min(width - 1, x+1), y]

            if (high_pixel > pixel):
                out = test_mp_axe(newImage, pixels, x, y,
                                  high_pixel, pixel, True, high_pixel)
                out = test_fs_longduck(newImage, pixels, x, y,
                                       high_pixel, pixel, True, high_pixel)
                out = test_fs_duck(newImage, pixels, x, y, high_pixel,
                                   pixel, True, high_pixel)

    # Return new image
    return newImage


def main(argv):
    files = [f for f in listdir("./") if isfile(join("./", f))]
    for file in files:
        if file == "images.py" or file == "ramps.psd":
            continue
        print(file)
        img = open_image(file)
        no_irreg = fill_irregularities(img)
        edges = find_edges(no_irreg)
        [render, ramps] = create_ramps(edges, img)
        rampImage = draw_ramps(ramps, edges)

        out = mix_image(img, rampImage, 0.5)
        # out.show()
        save_image(out, "out/out-" + file)
        # break


if __name__ == "__main__":
    # execute only if run as a script
    main(sys.argv[1:])
