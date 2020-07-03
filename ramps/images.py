import Image
import ImageDraw
# from PIL import Image, ImageDraw
import sys
import math
from os import listdir
from os.path import isfile, join


# Open an Image


def open_image(path):
    newImage = Image.open(path)
    return newImage

# Save Image


def save_image(image, path):
    image.save(path, 'png')

# Create a new image with the given size


def create_image(i, j):
    image = Image.new("RGB", (i, j), "black")
    return image

# Get the pixel from the given image


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

    black = (0, 0, 0)
    high = (184, 184, 184)
    low = (86, 86, 86)

    lastcolor = (-1, -1, -1)

    # for y in range(height):
    #     for x in range(width):
    #         pixels[x, y] = black
    # Transform to grayscale
    for y in range(height):
        for x in range(width):
            # Get Pixel

            pixel = get_pixel(image, x, y)
            if (pixel == black):
                continue

            high_pixel = get_pixel(image, x-1, y)
            if (high_pixel > pixel):
                pixels[x, y] = (255, 0, 0)

        for x in range(width - 1, -1, -1):
            # Get Pixel
            pixel = get_pixel(image, x, y)
            if (pixel == black or not pixels[x, y] == black):
                continue

            high_pixel = get_pixel(image, min(width - 1, x+1), y)
            if (high_pixel > pixel):
                pixels[x, y] = (0, 255, 0)

    for x in range(width):
        for y in range(height):
            pixel = get_pixel(image, x, y)
            if (pixel == black or not pixels[x, y] == black):
                continue

            high_pixel = get_pixel(image, x, y-1)
            if (high_pixel > pixel):
                pixels[x, y] = (0, 0, 255)

        for y in range(height - 1, -1, -1):
            pixel = get_pixel(image, x, y)
            if (pixel == black or not pixels[x, y] == black):
                continue

            high_pixel = get_pixel(image, x, min(height - 1, y+1))
            if (high_pixel > pixel):
                pixels[x, y] = (0, 255, 255)

    # for y in range(height):
    #     for x in range(width):
    #         if pixels[x, y] == black:
    #             (r, g, b) = get_pixel(image, x, y)
    #             pixels[x, y] = (
    #                 r//4, g//4, b//4)

    # Return new image
    return new


def create_ramps(image, original):
    width, height = image.size
    black = (0, 0, 0)

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

        processed[x, y] = (255, 255, 255)
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

    new.show()
    return [new, ramps]


def draw_ramps(ramps, image):
    width, height = image.size

    # creating new Image object
    img = Image.new("RGB", (width, height))

    # create line image
    img1 = ImageDraw.Draw(img)
    img1.line(shape, fill="none", width=0)


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


def mix((r, g, b), (r2, g2, b2)):
    return ((r+r2)/2, (g+g2)/2, (b+b2)/2)


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

    black = (0, 0, 0)
    green = (0, 255, 0)
    magenta = (255, 0, 255)

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
        render.show()
        # rampImage = draw_ramps(ramps, img)
        # save_image(rampImage, "out/out-" + file)
        break


if __name__ == "__main__":
    # execute only if run as a script
    main(sys.argv[1:])
