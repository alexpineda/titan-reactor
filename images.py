import Image
import sys
import math

# Open an Image


def open_image(path):
    newImage = Image.open(path)
    return newImage

# Save Image


def save_image(image, path):
    image.save(path, 'png')

# Create a new image with the given size


def create_image(i, j):
    image = Image.new("RGB", (i, j), "white")
    return image

# Get the pixel from the given image


def get_pixel(image, i, j):
    # Inside image bounds?
    width, height = image.size
    if i > width or j > height or i < 0 or j < 0:
        return None

    # Get Pixel
    pixel = image.getpixel((i, j))
    return pixel

# Create a Grayscale version of the image


def convert_grayscale(image):
    # Get size
    width, height = image.size

    # Create new Image and a Pixel Map
    new = create_image(width, height)
    pixels = new.load()

    # Transform to grayscale
    for i in range(width):
        for j in range(height):
            # Get Pixel
            pixel = get_pixel(image, i, j)

            # Get R, G, B values (This are int from 0 to 255)
            red = pixel[0]
            green = pixel[1]
            blue = pixel[2]

            # Transform to grayscale
            gray = (red * 0.299) + (green * 0.587) + (blue * 0.114)

            # Set Pixel in new image
            pixels[i, j] = (red, 0, 0)

        # Return new image
        return new

# ltr htl


def find_ramps(image):
    # Get size
    width, height = image.size

    # Create new Image and a Pixel Map
    new = create_image(width, height)
    pixels = new.load()

    black = (0, 0, 0)
    high = (184, 184, 184)
    low = (86, 86, 86)

    lastcolor = (-1, -1, -1)

    # Transform to grayscale
    for y in range(height):
        for x in range(width):
            # Get Pixel

            pixel = get_pixel(image, x, y)
            if (pixel == black):
                continue

            prev_pixel = get_pixel(image, x-1, y)
            pixels[x, y] = pixel

            if (prev_pixel > pixel):
                pixels[x, y] = (255, 0, 0)
            else:
                pixels[x, y] = (pixel[0]//2, pixel[1]//2, pixel[2]//2)

    # Return new image
    return new


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


def test_pattern(image, pattern, x, y, flipX=False, offset=0):
    if flipX:
        for j in range(len(pattern)):
            pattern[j] = pattern[j][::-1]
        offset = -len(pattern[0]) + 1

    def same_color(i, j, color):
        return get_pixel(image, x + i, y + j) == color

    h = len(pattern)
    w = len(pattern[0])

    for j in range(h):
        for i in range(w):
            if not same_color(i + offset, j, pattern[j][i]):
                return False

    return True


def test_duck(image, x, y, highcolor, lowcolor, flipX=False, offset=0):
    pattern = [
        [lowcolor, lowcolor, highcolor, highcolor],
        [lowcolor, lowcolor, highcolor, highcolor],
        [lowcolor, lowcolor, lowcolor, lowcolor],
        [lowcolor, lowcolor, lowcolor, lowcolor],
    ]

    return test_pattern(image, pattern, x, y, flipX, offset)


def test_longduck(image, x, y, highcolor, lowcolor, flipX=False, offset=0):
    pattern = [
        [lowcolor, lowcolor, highcolor, highcolor, highcolor, highcolor],
        [lowcolor, lowcolor, highcolor, highcolor, highcolor, highcolor],
        [lowcolor, lowcolor, lowcolor, lowcolor, lowcolor, lowcolor],
        [lowcolor, lowcolor, lowcolor, lowcolor, lowcolor, lowcolor],
    ]

    return test_pattern(image, pattern, x, y, flipX, offset)


def draw_duck(pixels, x, y, color, offset=0):
    for i in range(4):
        for j in range(4):
            pixels[x + i + offset, y + j] = color


def draw_longduck(pixels, x, y, color, offset=0):
    for i in range(6):
        for j in range(4):
            pixels[x + i + offset, y + j] = color


def fill_irregularities(image):
    # Get size
    width, height = image.size

    # Create new Image and a Pixel Map
    new = create_image(width, height)
    pixels = new.load()

    black = (0, 0, 0)
    green = (0, 255, 0)
    magenta = (255, 0, 255)
    total_fixes = 0

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
                if test_longduck(image, x, y, high_pixel, pixel):
                    draw_longduck(pixels, x, y, green)
                    x = x + 6
                elif test_duck(image, x, y, high_pixel, pixel):
                    draw_duck(pixels, x, y, green)
                    x = x + 4

        for x in range(width - 1, -1, -1):
            # Get Pixel
            pixel = pixels[x, y]
            if (pixel == black or pixel == green or pixel == magenta):
                continue

            high_pixel = pixels[min(width - 1, x+1), y]

            if (high_pixel > pixel and not high_pixel == magenta):
                if test_longduck(image, x, y, high_pixel, pixel, True):
                    draw_longduck(pixels, x, y, green, -5)
                    x = x - 5
                if test_duck(image, x, y, high_pixel, pixel, True):
                    draw_duck(pixels, x, y, green, -3)
                    x = x - 3

    # Return new image
    return new


def nearest(image):
    # Get size
    scale = 0.5
    width, height = image.size
    dstWidth = int(width // 2)
    dstHeight = int(height // 2)

    # Create new Image and a Pixel Map
    new = create_image(dstWidth, dstHeight)
    pixels = new.load()

    lastcolor = None

    # Transform to grayscale
    for y in range(dstWidth):
        for x in range(dstHeight):
            pixels[x, y] = get_pixel(image, int(
                math.floor(x / scale)), int(math.floor(y / scale)))

    return new


def main(argv):
    img = open_image("matchpoint.png")
    # processed = find_ramps(img)
    processed = fill_irregularities(img)
    # processed = nearest(img)

    save_image(processed, "out.png")


if __name__ == "__main__":
    # execute only if run as a script
    main(sys.argv[1:])
