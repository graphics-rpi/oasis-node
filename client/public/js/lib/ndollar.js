/**
 * The $N Multistroke Recognizer (JavaScript version)
 *
 *	Lisa Anthony, Ph.D.
 *    UMBC
 *    Information Systems Department
 *    1000 Hilltop Circle
 *    Baltimore, MD 21250
 *    lanthony@umbc.edu
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 * The academic publications for the $N recognizer, and what should be 
 * used to cite it, are:
 *
 *	Anthony, L. and Wobbrock, J.O. (2010). A lightweight multistroke 
 *	  recognizer for user interface prototypes. Proceedings of Graphics 
 *	  Interface (GI '10). Ottawa, Ontario (May 31-June 2, 2010). Toronto, 
 *	  Ontario: Canadian Information Processing Society, pp. 245-252.
 *
 *	Anthony, L. and Wobbrock, J.O. (2012). $N-Protractor: A fast and 
 *	  accurate multistroke recognizer. Proceedings of Graphics Interface 
 *	  (GI '12). Toronto, Ontario (May 28-30, 2012). Toronto, Ontario: 
 *	  Canadian Information Processing Society, pp. 117-120.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed 
 * here by Jacob O. Wobbrock and Lisa Anthony:
 *
 *	Li, y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2011, Jacob O. Wobbrock and Lisa Anthony.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the names of UMBC nor the University of Washington,
 *    nor the names of its contributors may be used to endorse or promote
 *    products derived from this software without specific prior written
 *    permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Lisa Anthony OR Jacob O. Wobbrock
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
**/
//
// nPoint class
//
function nPoint(x, y) // constructor
{
	this.x = x;
	this.y = y;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.x = x;
	this.y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, useBoundedRotationInvariance, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleDimTo(this.Points, SquareSize, OneDThreshold);
	if (useBoundedRotationInvariance)
		this.Points = RotateBy(this.Points, +radians); // restore
	this.Points = TranslateTo(this.Points, Origin);
	this.StartUnitVector = CalcStartUnitVector(this.Points, StartAngleIndex);
	this.Vector = Vectorize(this.Points, useBoundedRotationInvariance); // for Protractor
}
//
// Multistroke class: a container for unistrokes
//
function Multistroke(name, useBoundedRotationInvariance, strokes) // constructor
{
	this.Name = name;
	this.NumStrokes = strokes.length; // number of individual strokes

	var order = new Array(strokes.length); // array of integer indices
	for (var i = 0; i < strokes.length; i++)
		order[i] = i; // initialize
	var orders = new Array(); // array of integer arrays
	HeapPermute(strokes.length, order, /*out*/ orders);

	var unistrokes = MakeUnistrokes(strokes, orders); // returns array of point arrays
	this.Unistrokes = new Array(unistrokes.length); // unistrokes for this multistroke
	for (var j = 0; j < unistrokes.length; j++)
		this.Unistrokes[j] = new Unistroke(name, useBoundedRotationInvariance, unistrokes[j]);
}
//
// Result class
//
function Result(name, score) // constructor
{
	this.Name = name;
	this.Score = score;
}
//
// NDollarRecognizer class constants
//
var NumMultistrokes = 4;
var NumPoints = 96;
var SquareSize = 250.0;
var OneDThreshold = 0.25; // customize to desired gesture set (usually 0.20 - 0.35)
var Origin = new nPoint(0,0);
var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
var HalfDiagonal = 0.5 * Diagonal;
var AngleRange = Deg2Rad(45.0);
var AnglePrecision = Deg2Rad(2.0);
var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
var StartAngleIndex = (NumPoints / 8); // eighth of gesture length
var AngleSimilarityThreshold = Deg2Rad(30.0);
//
// NDollarRecognizer class
//
function NDollarRecognizer(useBoundedRotationInvariance) // constructor
{
	//
	// one predefined multistroke for each multistroke type
	//
	this.Multistrokes = new Array(NumMultistrokes);

	// this.Multistrokes[0] = new Multistroke("rect", useBoundedRotationInvariance, new Array(
	// 	new Array(new nPoint(700,700), new nPoint(800,700)),
	// 	new Array(new nPoint(800,700), new nPoint(800,750)),
	// 	new Array(new nPoint(800,750), new nPoint(700,750)),
	// 	new Array(new nPoint(700,750), new nPoint(700,700))
	// ));
	// this.Multistrokes[1] = new Multistroke("rect", useBoundedRotationInvariance, new Array(
	// 	new Array(new nPoint(700,700), new nPoint(750,700)),
	// 	new Array(new nPoint(750,700), new nPoint(750,800)),
	// 	new Array(new nPoint(750,800), new nPoint(700,800)),
	// 	new Array(new nPoint(700,800), new nPoint(700,700))
	// ));
	// //rect 45 degrees
	// this.Multistrokes[2] = new Multistroke("rect", useBoundedRotationInvariance, new Array(
	// 	new Array(new nPoint(142.68,96.97), new nPoint(178.03,132.32)),
	// 	new Array(new nPoint(178.03,132.32), new nPoint(107.32,203.03)),
	// 	new Array(new nPoint(107.32,203.03), new nPoint(71.97,167.68)),
	// 	new Array(new nPoint(71.97,167.68), new nPoint(142.68,96.97))
	// ));
	// this.Multistrokes[3] = new Multistroke("rect", useBoundedRotationInvariance, new Array(
	// 	new Array(new nPoint(71.97,132.32), new nPoint(107.32,96.97)),
	// 	new Array(new nPoint(107.32,96.97), new nPoint(178.03,167.68)),
	// 	new Array(new nPoint(178.03,167.68), new nPoint(142.68,203.03)),
	// 	new Array(new nPoint(142.68,203.03), new nPoint(71.97,132.32))
	// ));
	this.Multistrokes[0] = new Multistroke("D", useBoundedRotationInvariance, new Array(
		new Array(new nPoint(345,9),new nPoint(345,87)),
		new Array(new nPoint(351,8),new nPoint(363,8),new nPoint(372,9),new nPoint(380,11),new nPoint(386,14),new nPoint(391,17),new nPoint(394,22),new nPoint(397,28),new nPoint(399,34),new nPoint(400,42),new nPoint(400,50),new nPoint(400,56),new nPoint(399,61),new nPoint(397,66),new nPoint(394,70),new nPoint(391,74),new nPoint(386,78),new nPoint(382,81),new nPoint(377,83),new nPoint(372,85),new nPoint(367,87),new nPoint(360,87),new nPoint(355,88),new nPoint(349,87))
	));
	this.Multistrokes[1] = new Multistroke("B", useBoundedRotationInvariance, new Array(
		new Array(new nPoint(507,8),new nPoint(507,108)),
		new Array(new nPoint(513,7),new nPoint(528,7),new nPoint(537,8),new nPoint(544,10),new nPoint(550,12),new nPoint(555,15),new nPoint(558,18),new nPoint(560,22),new nPoint(561,27),new nPoint(562,33),new nPoint(561,37),new nPoint(559,42),new nPoint(556,45),new nPoint(550,48),new nPoint(544,51),new nPoint(538,53),new nPoint(532,54),new nPoint(525,55),new nPoint(519,55),new nPoint(513,55),new nPoint(510,55)),
		new Array(new nPoint(513,57),new nPoint(528,57),new nPoint(537,58),new nPoint(544,60),new nPoint(550,62),new nPoint(555,65),new nPoint(558,68),new nPoint(560,72),new nPoint(561,77),new nPoint(562,83),new nPoint(561,87),new nPoint(559,92),new nPoint(556,95),new nPoint(550,98),new nPoint(544,101),new nPoint(538,103),new nPoint(532,104),new nPoint(525,105),new nPoint(519,105),new nPoint(513,105),new nPoint(510,105))
	));
	this.Multistrokes[2] = new Multistroke("W", useBoundedRotationInvariance, new Array(
		new Array(new nPoint(500,100),new nPoint(520,180),new nPoint(550,150),new nPoint(580,180),new nPoint(600,100))
	));
	this.Multistrokes[3] = new Multistroke("S", useBoundedRotationInvariance, new Array(
		new Array(new nPoint(623,239),new nPoint(604.8,239),new nPoint(590,254.6),new nPoint(601.9,271.9),
			new nPoint(618,287.5), new nPoint(611.1,308.9), new nPoint(589,306))
	));
	
	//
	// The $N Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function(strokes, useBoundedRotationInvariance, requireSameNoOfStrokes, useProtractor)
	{
		var points = CombineStrokes(strokes); // make one connected unistroke from the given strokes
		points = Resample(points, NumPoints);
		var radians = IndicativeAngle(points);
		points = RotateBy(points, -radians);
		points = ScaleDimTo(points, SquareSize, OneDThreshold);
		if (useBoundedRotationInvariance)
			points = RotateBy(points, +radians); // restore
		points = TranslateTo(points, Origin);
		var startv = CalcStartUnitVector(points, StartAngleIndex);
		var vector = Vectorize(points, useBoundedRotationInvariance); // for Protractor

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < this.Multistrokes.length; i++) // for each multistroke
		{
			if (!requireSameNoOfStrokes || strokes.length == this.Multistrokes[i].NumStrokes) // optional -- only attempt match when same # of component strokes
			{
				for (var j = 0; j < this.Multistrokes[i].Unistrokes.length; j++) // each unistroke within this multistroke
				{
					if (AngleBetweenUnitVectors(startv, this.Multistrokes[i].Unistrokes[j].StartUnitVector) <= AngleSimilarityThreshold) // strokes start in the same direction
					{
						var d;
						if (useProtractor) // for Protractor
							d = OptimalCosineDistance(this.Multistrokes[i].Unistrokes[j].Vector, vector);
						else // Golden Section Search (original $N)
							d = DistanceAtBestAngle(points, this.Multistrokes[i].Unistrokes[j], -AngleRange, +AngleRange, AnglePrecision);
						if (d < b) {
							b = d; // best (least) distance
							u = i; // multistroke owner of unistroke
						}
					}
				}
			}
		}
		return (u == -1) ? new Result("No match.", 0.0) : new Result(this.Multistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
	};
	this.AddGesture = function(name, useBoundedRotationInvariance, strokes)
	{
		this.Multistrokes[this.Multistrokes.length] = new Multistroke(name, useBoundedRotationInvariance, strokes);
		var num = 0;
		for (var i = 0; i < this.Multistrokes.length; i++) {
			if (this.Multistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function()
	{
		this.Multistrokes.length = NumMultistrokes; // clear any beyond the original set
		return NumMultistrokes;
	}
}
//
// Private helper functions from this point down
//
function HeapPermute(n, order, /*out*/ orders)
{
	if (n == 1)
	{
		orders[orders.length] = order.slice(); // append copy
	}
	else
	{
		for (var i = 0; i < n; i++)
		{
			HeapPermute(n - 1, order, orders);
			if (n % 2 == 1) // swap 0, n-1
			{
				var tmp = order[0];
				order[0] = order[n - 1];
				order[n - 1] = tmp;
			}
			else // swap i, n-1
			{
				var tmp = order[i];
				order[i] = order[n - 1];
				order[n - 1] = tmp;
			}
		}
	}
}
function MakeUnistrokes(strokes, orders)
{
	var unistrokes = new Array(); // array of point arrays
	for (var r = 0; r < orders.length; r++)
	{
		for (var b = 0; b < Math.pow(2, orders[r].length); b++) // use b's bits for directions
		{
			var unistroke = new Array(); // array of points
			for (var i = 0; i < orders[r].length; i++)
			{
				var pts;
				if (((b >> i) & 1) == 1) {  // is b's bit at index i on?
					pts = strokes[orders[r][i]].slice().reverse(); // copy and reverse
				} else {
					pts = strokes[orders[r][i]].slice(); // copy
				}
				for (var p = 0; p < pts.length; p++) {
					unistroke[unistroke.length] = pts[p]; // append points
				}
			}
			unistrokes[unistrokes.length] = unistroke; // add one unistroke to set
		}
	}
	return unistrokes;
}
function CombineStrokes(strokes)
{
	var points = new Array();
	for (var s = 0; s < strokes.length; s++) {
		for (var p = 0; p < strokes[s].length; p++) {
			points[points.length] = new nPoint(strokes[s][p].x, strokes[s][p].y);
		}
	}
	return points;
}
function Resample(points, n)
{
	// console.log(0.1111);
	var I = nPathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	// console.log(0.1112);
	for (var i = 1; i < points.length; i++)
	{
		//console.log(0.1113);
		var d = nDistance(points[i - 1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i - 1].x + ((I - D) / d) * (points[i].x - points[i - 1].x);
			var qy = points[i - 1].y + ((I - D) / d) * (points[i].y - points[i - 1].y);
			var qxp = parseFloat(qx.toFixed(3));
			var qyp = parseFloat(qy.toFixed(3));
			var q = new nPoint(qxp, qyp);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	// console.log(0.1114);
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new nPoint(points[points.length - 1].x, points[points.length - 1].y);
	// console.log(0.1115);
	return newpoints;
}
function IndicativeAngle(points)
{
	var c = nCentroid(points);
	return Math.atan2(c.y - points[0].y, c.x - points[0].x);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = nCentroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].x - c.x) * cos - (points[i].y - c.y) * sin + c.x
		var qy = (points[i].x - c.x) * sin + (points[i].y - c.y) * cos + c.y;
		newpoints[newpoints.length] = new nPoint(qx, qy);
	}
	return newpoints;
}
function ScaleDimTo(points, size, ratio1D) // scales bbox uniformly for 1D, non-uniformly for 2D
{
	var B = nBoundingBox(points);
	var uniformly = Math.min(B.Width / B.Height, B.Height / B.Width) <= ratio1D; // 1D or 2D gesture test
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = uniformly ? points[i].x * (size / Math.max(B.Width, B.Height)) : points[i].x * (size / B.Width);
		var qy = uniformly ? points[i].y * (size / Math.max(B.Width, B.Height)) : points[i].y * (size / B.Height);
		newpoints[newpoints.length] = new nPoint(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = nCentroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].x + pt.x - c.x;
		var qy = points[i].y + pt.y - c.y;
		newpoints[newpoints.length] = new nPoint(qx, qy);
	}
	return newpoints;
}
function Vectorize(points, useBoundedRotationInvariance) // for Protractor
{
	var cos = 1.0;
	var sin = 0.0;
	if (useBoundedRotationInvariance) {
		var iAngle = Math.atan2(points[0].y, points[0].x);
		var baseOrientation = (Math.PI / 4.0) * Math.floor((iAngle + Math.PI / 8.0) / (Math.PI / 4.0));
		cos = Math.cos(baseOrientation - iAngle);
		sin = Math.sin(baseOrientation - iAngle);
	}
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		var newX = points[i].x * cos - points[i].y * sin;
		var newY = points[i].y * cos + points[i].x * sin;
		vector[vector.length] = newX;
		vector[vector.length] = newY;
		sum += newX * newX + newY * newY;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
        b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold)
{
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold)
	{
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians)
{
	var newpoints = RotateBy(points, radians);
	return nPathDistance(newpoints, T.Points);
}
function nCentroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		try{
		x += points[i].x;
		y += points[i].y;
	}
	catch(err) {
		console.log(err, points);
	}
	}
	x /= points.length;
	y /= points.length;
	return new nPoint(x, y);
}
function nBoundingBox(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].x);
		minY = Math.min(minY, points[i].y);
		maxX = Math.max(maxX, points[i].x);
		maxY = Math.max(maxY, points[i].y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function nPathDistance(pts1, pts2) // average distance between corresponding points in two paths
{
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += nDistance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function nPathLength(points) // length traversed by a point path
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += nDistance(points[i - 1], points[i]);
	return d;
}
function nDistance(p1, p2) // distance between two points
{
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	return Math.sqrt(dx * dx + dy * dy);
}
function CalcStartUnitVector(points, index) // start angle from points[0] to points[index] normalized as a unit vector
{
	var v = new nPoint(points[index].x - points[0].x, points[index].y - points[0].y);
	var len = Math.sqrt(v.x * v.x + v.y * v.y);
	return new nPoint(v.x / len, v.y / len);
}
function AngleBetweenUnitVectors(v1, v2) // gives acute angle between unit vectors from (0,0) to v1, and (0,0) to v2
{
	var n = (v1.x * v2.x + v1.y * v2.y);
	if (n < -1.0 || n > +1.0)
		n = Round(n, 5); // fix: JavaScript rounding bug that can occur so that -1 <= n <= +1
	return Math.acos(n); // arc cosine of the vector dot product
}
function Round(n,d) { d = Math.pow(10,d); return Math.round(n*d)/d; } // round 'n' to 'd' decimals
function Deg2Rad(d) { return (d * Math.PI / 180.0); }