
// take path element and returns start point and end point
export function extractPathPoints(path) {
  const pathPoints = path.props.d.replace('M','').replace('L',',').split(',');
  return {startPoint: [Number(pathPoints[0]),Number(pathPoints[1])],
          endPoint: [Number(pathPoints[2]), Number(pathPoints[3])]}
}

export function magVec(vec) {
  return Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
}

export function metersToPixels(num, r) {
  const f = num/0.3048;
  const t = f * 0.0254;
  return (t*r*2)/1.0668;
}

export function dotVec(vec1, vec2) {
  // Returns the dot product
  return vec1[0] * vec2[0] + vec1[1] * vec2[1];
}

export function normalizeVector(vec) {
  var mag = magVec(vec);
  return [vec[0] / mag, vec[1] / mag];
}

export function createPathStr(startX, startY, endX, endY) {
  return "M" + startX + "," + startY + "L" + endX + "," + endY;
}

export function negateVec(vec) {
  return [-1 * vec[0], -1 * vec[1]];
}

export function convertLine2Vector(startPoint, endPoint) {
  return normalizeVector([endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]]);
}

export function angleBtwVec(vec1, vec2) {
  // Computes the angles between vectors
  return Math.acos(dotVec(vec1, vec2) / (magVec(vec1) * magVec(vec2)));
}

export function pDistance(x, y, x1, y1, x2, y2) {
  // Joshua http://stackoverflow.com/users/368954/joshua

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq !== 0) //in case of 0 length line
    param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);

}

export function getDistancePtOnLineSeg(pt, line_start, line_end) {
  var x = pt[0];
  var y = pt[1];

  var x1 = line_start[0];
  var y1 = line_start[1];

  var x2 = line_end[0];
  var y2 = line_end[1];

  return pDistance(x, y, x1, y1, x2, y2);
}

export function getSlope(pt1, pt2) {
  var a = (pt2[1] - pt1[1]) / (pt2[0] - pt1[0]);
  if (a > 1000)
    return 1000;
  if (a < -1000)
    return -1000;
  if (a === 0)
    return .0001;
  return a;
}

export function line_intersection(m_1, pt1, m_2, pt2) {
  var x_1 = pt1[0];
  var y_1 = pt1[1];

  var x_2 = pt2[0];
  var y_2 = pt2[1];

  var x = (-m_2 * x_2 + y_2 + m_1 * x_1 - y_1) / (m_1 - m_2);
  var y = m_1 * (x - x_1) + y_1;

  return [x, y];
}

export function distancePts(a, b) {
  return Math.sqrt(Math.pow((a[0] - b[0]), 2) + Math.pow((a[1] - b[1]), 2));
}

export function inbetween(a, c, b) {
  var eps = .01;
  var dist = distancePts(a, c) + distancePts(c, b);
  return ((dist - distancePts(a, b)) < eps) && ((dist - distancePts(a, b)) > (eps * -1));
}

export function calc_long_lat(marker_abs_x, marker_abs_y, mapWidth, mapHeight) {
  // Returns a pair with the [long, lat]
  const x = marker_abs_x,
        y = marker_abs_y,
        mx = mapWidth,
        my = mapHeight,
        // unitx = mx / 36,
        unity = my / 15;

  var longitude, latitude;

  // positive values = North
  // negative values = South
  // positive values = East
  // negative values = West
  if (x >= mx / 2) {
    latitude = ((x - mx / 2) / (mx / 2)) * 180;
  } else {
    latitude = ((mx / 2 - x) / (mx / 2)) * -180;
  }

  if (y >= (unity * 9)) {
    longitude = -1*((y - (unity * 9)) / (unity * 6)) * 60;
  } else {
    longitude = ((unity * 9 - y) / (unity * 9)) * 90;
  }

  return [ longitude.toFixed(2), latitude.toFixed(2) ];
}

export function estimate_time_zone(longt) {
  longt = parseInt(longt, 10);
  var temp = longt + 7.5;
  var count = -1;
  while(temp > -180){
    count++;
    temp = temp - 15;
  }

  if(count === 9 || count === 17 || count===19 ||count===22 ||count===27)  {
    count++;
  } else if(count===21) {
    count+=2;
  }

  return count;
}

export function perpendicularVec(vec){
  return [  -vec[1] , vec[0] ];
}

export function getCornerPoints(start_pt, end_pt) {
  // Creates this array of four points
  // index 0 -- upper left corner
  // index 1 -- upper right corner
  // index 2 -- lower left corner
  // index 3 -- lower right corner

  var dirVec = convertLine2Vector(start_pt, end_pt);
  var perVec = perpendicularVec(dirVec);
  const PRIMITIVE_WIDTH = 4;

  var upper_left = [0,0];
  upper_left[0] = start_pt[0] + perVec[0] * (PRIMITIVE_WIDTH / 2.0);
  upper_left[1] = start_pt[1] + perVec[1] * (PRIMITIVE_WIDTH / 2.0);

  var lower_left = [0,0];
  lower_left[0] = start_pt[0] - 1 * perVec[0] * (PRIMITIVE_WIDTH / 2.0);
  lower_left[1] = start_pt[1] - 1 * perVec[1] * (PRIMITIVE_WIDTH / 2.0);

  var upper_right = [0,0];
  upper_right[0] = end_pt[0] + perVec[0] * (PRIMITIVE_WIDTH / 2.0);
  upper_right[1] = end_pt[1] + perVec[1] * (PRIMITIVE_WIDTH / 2.0);

  var lower_right = [0,0];
  lower_right[0] = end_pt[0] - 1 * perVec[0] * (PRIMITIVE_WIDTH / 2.0);
  lower_right[1] = end_pt[1] - 1 * perVec[1] * (PRIMITIVE_WIDTH / 2.0);

  return [upper_left, lower_left, lower_right, upper_right];
}

export function centerPoint(point, radius, cx, cy){
  const TABLE = 1.0668; //42 inches

  const scale = TABLE/(radius*2);
  const centeredPoint = [0,0];
  const x = point[0];
  const y = point[1];


  centeredPoint[0] = Math.round(10000*(cx - x)*scale)/10000;
  centeredPoint[1] = Math.round(10000*(cy - y)*scale)/10000;

  // finding these bugs are super required
  if( isNaN(centerPoint[0]) || isNaN(centerPoint[1]) ){
    //console.log("NaN bug found");
    // window.location = "../pages/login_page.php";
  }

  return centeredPoint;
}

/* used by gen wall data to put '+' on things */
export function toStr(num){
  return num>0 ? "+" + num : num;
}//tostr

export function nan_pt(pt) {
  return isNaN(pt[0]) || isNaN(pt[1]);
}

export function inch2meter(num) {
  return num/39.3701;
}
export function meter2inches(num) {
  return num*39.3701;
}

export function getHeight(num) {
  return Math.round(10000*inch2meter(num))/10000;
}

// utility
export function rotateAboutPoint(originX, originY, pointX, pointY, angle) {
  angle = angle * Math.PI / 180;

  const transformX = -1 * originX * Math.cos(angle) + originX + originY * Math.sin(angle);

  const transformY = -1 * originX * Math.sin(angle) - originY * Math.cos(angle) + originY;

  const xPoint = pointX * Math.cos(angle) + -1 * pointY * Math.sin(angle) + transformX;

  const yPoint = pointX * Math.sin(angle) + pointY * Math.cos(angle) + transformY;

  return {x:xPoint, y:yPoint};
}

export function insideBox(localCoord, topLeft, bottomRight) {
  const pointX = localCoord.x;
  const pointY = localCoord.y;
  const tlX = topLeft.x;
  const tlY = topLeft.y;
  const brX = bottomRight.x;
  const brY = bottomRight.y;

  return (pointX <= brX && pointX>=tlX) && (pointY <= brY && pointY >= tlY);
}

export function getAngle(centerX, centerY, rotationX, rotationY, height) {
  centerY = 500-centerY;
  rotationY = 500-rotationY;
  const rad = Math.acos((height * (rotationY-centerY)) / (height * Math.sqrt(Math.pow(rotationX-centerX,2) + Math.pow(rotationY-centerY, 2))));
  const angle = rad*180/Math.PI;
  return rotationX < centerX ? 360 - angle : angle;
}

export function pointInCircle(cx, cy, radius, x, y) {
  const centerPointDistance = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2));
  return centerPointDistance < radius;
}

export function getLocationString(long, lat) {
  const longitude = String(Math.abs(long)) + (long<0 ? "S" : "N");
  const latidude = String(Math.abs(lat)) + (lat<0 ? "W" : "E");
  return "(" + longitude + ', ' + latidude + ")";
}
