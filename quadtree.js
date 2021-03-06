// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// QuadTree

class Point {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.userData = data;
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x; //Center x
    this.y = y; //Center y
    this.w = w; // Half the width
    this.h = h; // Half the height
  }

  contains(point) {
    return (point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h);
  }


  intersects(range) {
    return !(range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h);
  }


}

// circle class for a circle shaped query
class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rSquared = this.r * this.r;
  }

  contains(point) {
    // check if the point is in the circle by checking if the euclidean distance of
    // the point and the center of the circle if smaller or equal to the radius of
    // the circle
    let d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
    return d <= this.rSquared;
  }

  intersects(range) {

    let xDist = Math.abs(range.x - this.x);
    let yDist = Math.abs(range.y - this.y);

    // radius of the circle
    let r = this.r;

    let w = range.w;
    let h = range.h;

    let edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

    // no intersection
    if (xDist > (r + w) || yDist > (r + h))
      return false;

    // intersection within the circle
    if (xDist <= w || yDist <= h)
      return true;

    // intersection on the edge of the circle
    return edges <= this.rSquared;
  }
}

class QuadTree {
  constructor(boundary, capacity) {
    if (!boundary) {
      throw TypeError('boundary is null or undefined');
    }
    if (!(boundary instanceof Rectangle)) {
      throw TypeError('boundary should be a Rectangle');
    }
    if (typeof capacity !== 'number') {
      throw TypeError(`capacity should be a number but is a ${typeof capacity}`);
    }
    if (capacity < 1) {
      throw RangeError('capacity must be greater than 0');
    }
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w / 2;
    let h = this.boundary.h / 2;

    let ne = new Rectangle(x + w, y - h, w, h);
    this.northeast = new QuadTree(ne, this.capacity);
    let nw = new Rectangle(x - w, y - h, w, h);
    this.northwest = new QuadTree(nw, this.capacity);
    let se = new Rectangle(x + w, y + h, w, h);
    this.southeast = new QuadTree(se, this.capacity);
    let sw = new Rectangle(x - w, y + h, w, h);
    this.southwest = new QuadTree(sw, this.capacity);
    this.divided = true;
    //Now reinsert
    for (let p of this.points)
    {
      this.insert(p);
    }

    //Now clean
    this.points = [];
  }

  insert(point) {
    //Try to insert point in this rectangle. If it's not divided, but the limit is exceeded, divide. If divided, add to first quadrant that can
    //have this point (do not add it to all the quadrants if its on the border)
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (!this.divided)
    {
      if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
      }
      else {
        this.subdivide();
      }
    }


    return (this.northeast.insert(point) || this.northwest.insert(point) ||
      this.southeast.insert(point) || this.southwest.insert(point));
  }

  query(range, found) {
    let count = 0;
    //Find all points in current rectangle and all its children
    if (!found) {
      found = [];
    }


    if (!range.intersects(this.boundary)) {
      return {count, found};
    }

    for (let p of this.points) {
      count++;

      if (range.contains(p)) {
        found.push(p);
      }
    }
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;
    let count4 = 0;
    if (this.divided) {
      count1 = this.northwest.query(range, found).count;
      count2 = this.northeast.query(range, found).count;
      count3 = this.southwest.query(range, found).count;
      count4 = this.southeast.query(range, found).count;
    }

    return {found: found, count: count + count1 + count2 + count3 + count4};
  }

}

if (typeof module !== "undefined") {
  module.exports = { Point, Rectangle, QuadTree, Circle };
}
