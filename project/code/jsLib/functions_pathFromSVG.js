function createPathFromSVG ( pathToUse ) {
    createPathFromSVG_getAllPoints( pathToUse );
    //displayPathOnConsole();
    var pathToUseLength = Object.keys(pathToUse).length;
    createPathFromSVG_scalePath ( pathToUse, pathToUseLength );
    // tX= -15;   tY= 0;   tZ= -50;  
    createPathFromSVG_translatePointsPos ( pathToUse, pathToUseLength, -15, 0, -50 );
    //displayPathOnConsole();
    createPathFromSVG_removeDuplicatePoints( pathToUse, pathToUseLength )
    //displayPathOnConsole();
    pathToUseLength = Object.keys(pathToUse).length;
    createPathFromSVG_adjustIntersections( pathToUse, pathToUseLength );
    //displayPathOnConsole();
    }


function createPathFromSVG_adjustIntersections ( pathToUse, pathToUseLength ) {
    var pathSegments = [];
    var pointsModified = [];
    pathSegments = path_getSegments ( pathToUse );
    var pIntersection = 400;
    //console.log ( pathSegments );
    for ( var s1=0; s1<pathSegments.length; s1++ ) {
        for ( var s2=(s1+1); s2<pathSegments.length; s2++ ) {
            var noOtherChecks = false;
            var pointAlreadyMod = false;
            var s1_0 = pathSegments[s1][0];
            var s1_1 = pathSegments[s1][1];
            var s2_0 = pathSegments[s2][0];
            var s2_1 = pathSegments[s2][1];
            var s1_0X = pathToUse[ s1_0 ].pos[0];
            var s1_1X = pathToUse[ s1_1 ].pos[0];
            var s1_0Z = pathToUse[ s1_0 ].pos[2];
            var s1_1Z = pathToUse[ s1_1 ].pos[2];
            var s2_0X = pathToUse[ s2_0 ].pos[0];
            var s2_1X = pathToUse[ s2_1 ].pos[0];
            var s2_0Z = pathToUse[ s2_0 ].pos[2];
            var s2_1Z = pathToUse[ s2_1 ].pos[2];
            var s1_maxX = Math.max( s1_0X, s1_1X );
            var s1_minX = Math.min( s1_0X, s1_1X );
            var s1_maxZ = Math.max( s1_0Z, s1_1Z );
            var s1_minZ = Math.min( s1_0Z, s1_1Z );
            var s2_maxX = Math.max( s2_0X, s2_1X );
            var s2_minX = Math.min( s2_0X, s2_1X );
            var s2_maxZ = Math.max( s2_0Z, s2_1Z );
            var s2_minZ = Math.min( s2_0Z, s2_1Z );
            /*** case 1: the 2 segments s1 and s2 have not a single point in common ***/
            if ( s2_maxZ<s1_minZ || s2_minZ>s1_maxZ || s2_maxX<s1_minX || s2_minX>s1_maxX )
                noOtherChecks = true;
            /*** case 2: the 2 segments have 1 point in common tha is a direct point from the path solved in the function 
            **      createPathFromSVG_removeDuplicatePoints; check if one of the points of s1 is the same as one of the
            **      points in s2 ***/
            if ( !noOtherChecks && ( s1_0===s2_0 || s1_0===s2_1 || s1_1===s2_0 || s1_1===s2_1 ) )
                noOtherChecks = true;
            /*** case 3: the 2 segments have 1 point in common that is a point from the path and lays on the segment of s1 or s2
            **      there is no need to add another point, just adjust the adj of the point itself and the max/min points of the
            **      segment
            **      z = mx + q;     (x2-x1)*(z-z1) - (z2-z1)*(z-z1) = 0         m = (z2-z1)/(x2-x1)         q = z-mx    ***/
            var sZ_m = ( s1_1Z - s1_0Z ) / ( s1_1X - s1_0X );
            var sZ_q = s1_0Z - sZ_m*s1_0X;
            //console.log( s1_1X - s1_0X );
            createPathFromSVG_case3_adjustPoints ( pathToUse, pointsModified, noOtherChecks, sZ_m, sZ_q, s1_0, s1_1, s1_minX, s1_maxX, s1_0X, s1_0Z, s2_0, s2_0X, s2_0Z );
            createPathFromSVG_case3_adjustPoints ( pathToUse, pointsModified, noOtherChecks, sZ_m, sZ_q, s1_0, s1_1, s1_minX, s1_maxX, s1_0X, s1_0Z, s2_1, s2_1X, s2_1Z );
            // if I have vertical segments
            var sX_m = ( s1_1X - s1_0X ) / ( s1_1Z - s1_0Z );
            var sX_q = s1_0X - sX_m*s1_0Z;
            //console.log( s1_1Z - s1_0Z );
            createPathFromSVG_case3_adjustPoints ( pathToUse, pointsModified, noOtherChecks, sX_m, sX_q, s1_0, s1_1, s1_minZ, s1_maxZ, s1_0Z, s1_0X, s2_0, s2_0Z, s2_0X );
            createPathFromSVG_case3_adjustPoints ( pathToUse, pointsModified, noOtherChecks, sX_m, sX_q, s1_0, s1_1, s1_minZ, s1_maxZ, s1_0Z, s1_0X, s2_1, s2_1Z, s2_1X );
            /*** case 4: the 2 segments have 1 point in common, that is not a point from path, and forms an intersection; need to find
            **      the point and then add it to the path and set his adj
            **      z = mx + q;     (x2-x1)*(z-z1) - (z2-z1)*(z-z1) = 0         m = (z2-z1)/(x2-x1)         q = z-mx    
            ***     m1x + q1 = m2x + q2         x = (q1 - q2) / (m2 - m1)               **/
            var s1m = ( s1_1Z - s1_0Z ) / ( s1_1X - s1_0X );
            var s1q = s1_0Z - s1m*s1_0X;
            var s2m = ( s2_1Z - s2_0Z ) / ( s2_1X - s2_0X );
            var s2q = s2_0Z - s2m*s2_0X;
            var x;  var z; 
            if ( s1_0X==s1_1X ) { // first segment is parallel to z
                x = s1_0X;
                if ( s2_0Z==s2_1Z ) // second segment is parallel to x
                    z = s2_0Z;
                else  // second segment is free, a normal rect
                    z = s1m*x + s1q;
            } else if ( s2_0X==s2_1X ) { // second segment is parallel to z
                x = s2_0X;
                if ( s1_0Z==s1_1Z ) // first segment is parallel to x
                    z = s1_0Z;
                else  // first segment is free, a normal rect
                    z = s2m*x + s2q;
            } else {
                x = Math.round( ( s1q - s2q ) / ( s2m - s1m ) );
                z = Math.round( s1m*x + s1q );
                }   
            if ( !noOtherChecks && !( s2m==s1m ) && 
                    !( (x==s1_0X && z==s1_0Z) || (x==s1_1X && z==s1_1Z) || (x==s2_0X && z==s2_0Z) || (x==s2_1X &&  z==s2_1Z) ) ) {
                //console.log ( "x: " + x + "   z: " + z + "   s1_0X: " + s1_0X + "   s1_0Z: " + s1_0Z + "   s1_1X: " + s1_1X + "   s1_1Z: " + s1_1Z );
                //console.log ( "x: " + x + "   z: " + z + "   s2_0X: " + s2_0X + "   s2_0Z: " + s2_0Z + "   s2_1X: " + s2_1X + "   s2_1Z: " + s2_1Z );
                pathToUse[ pIntersection ] = {};
                pathToUse[ pIntersection ].adj = {};                
                pathToUse[ pIntersection ].adj[ s1_0 ] = Math.sqrt( Math.pow( (s1_0X-x), 2 ) + Math.pow( s1_0Z-z, 2 ) );
                pathToUse[ pIntersection ].adj[ s1_1 ] = Math.sqrt( Math.pow( (s1_1X-x), 2 ) + Math.pow( s1_1Z-z, 2 ) );
                pathToUse[ pIntersection ].adj[ s2_0 ] = Math.sqrt( Math.pow( (s2_0X-x), 2 ) + Math.pow( s2_0Z-z, 2 ) );
                pathToUse[ pIntersection ].adj[ s2_1 ] = Math.sqrt( Math.pow( (s2_1X-x), 2 ) + Math.pow( s2_1Z-z, 2 ) );
                pathToUse[ pIntersection ].pos = [ x, 0, z ];
                pathToUse[ s1_0 ].adj[ pIntersection ] = Math.sqrt( Math.pow( (s1_0X-x), 2 ) + Math.pow( s1_0Z-z, 2 ) );
                pathToUse[ s1_1 ].adj[ pIntersection ] = Math.sqrt( Math.pow( (s1_1X-x), 2 ) + Math.pow( s1_1Z-z, 2 ) );
                pathToUse[ s2_0 ].adj[ pIntersection ] = Math.sqrt( Math.pow( (s2_0X-x), 2 ) + Math.pow( s2_0Z-z, 2 ) );
                pathToUse[ s2_1 ].adj[ pIntersection ] = Math.sqrt( Math.pow( (s2_1X-x), 2 ) + Math.pow( s2_1Z-z, 2 ) );
                delete pathToUse[ s1_0 ].adj[ s1_1 ];
                delete pathToUse[ s1_1 ].adj[ s1_0 ];
                delete pathToUse[ s2_0 ].adj[ s2_1 ];
                delete pathToUse[ s2_1 ].adj[ s2_0 ];
                pIntersection ++;
                }
            }
        }
    }


function createPathFromSVG_case3_adjustPoints ( pathToUse, pointsModified, noOtherChecks, m, q, s1_0, s1_1, s1min, s1_max, s1pX, s1pZ, s2p, s2pX, s2pZ ) {
    var pointAlreadyMod = false;
    for ( var pm=0; pm<pointsModified.length; pm++ ) 
        if ( pointsModified[ pm ]===s2p )
            pointAlreadyMod = true;
    if ( !noOtherChecks && !pointAlreadyMod && s2pX>s1min && s2pX<s1_max && (m*s2pX + q)==s2pZ ) {
        pointsModified.push( s2p );
        var pointsXDistance = s2pX - s1pX;
        var pointsZDistance = s2pZ - s1pZ;
        var pointsDistance = Math.sqrt( Math.pow( pointsXDistance, 2 ) + Math.pow( pointsZDistance, 2 ) );
        pathToUse[ s1_0 ].adj[ s2p ] = pointsDistance;
        pathToUse[ s1_1 ].adj[ s2p ] = pathToUse[ s1_0 ].adj[ s1_1 ] - pointsDistance;
        //console.log( s1_0 + "-" + s1_1 + "-" + s2p  );
        //console.log( pathToUse[ s1_0 ].adj[ s1_1 ] );
        //console.log( pathToUse[ s1_0 ].adj[ s1_1 ] - pointsDistance );
        pathToUse[ s2p ].adj[ s1_0 ] = pointsDistance;
        pathToUse[ s2p ].adj[ s1_1 ] = pathToUse[ s1_0 ].adj[ s1_1 ] - pointsDistance;
        delete pathToUse[ s1_0 ].adj[ s1_1 ];
        delete pathToUse[ s1_1 ].adj[ s1_0 ];
        }
    }


function createPathFromSVG_getAllPoints ( pathToUse ) {
	var svgLinesArray = jsonFromSVG["ns0:svg"]["ns0:g"]["ns0:g"]["ns0:line"];
    //for ( var j=3; j<10; j++ ) {
    for ( var j=0; j<svgLinesArray.length; j++ ) {
        var jsonPointIndex1String = (j*2+1).toString();
        var jsonPointIndex2String = (j*2+2).toString();
        var x1 = Math.round( svgLinesArray[j]["-x1"] );
        var x2 = Math.round( svgLinesArray[j]["-x2"] );
        var z1 = Math.round( svgLinesArray[j]["-y1"] );
        var z2 = Math.round( svgLinesArray[j]["-y2"] );
        var pointsXDistance = x2 - x1;
        var pointsZDistance = z2 - z1;
        pointsDistance = Math.sqrt( Math.pow( pointsXDistance, 2 ) + Math.pow( pointsZDistance, 2 ) );
        pathToUse[ jsonPointIndex1String ] = {};
        pathToUse[ jsonPointIndex1String ].adj = {};
        pathToUse[ jsonPointIndex1String ].adj[ jsonPointIndex2String ] = pointsDistance;
        pathToUse[ jsonPointIndex1String ].pos = [ x1, 0, z1 ];
        pathToUse[ jsonPointIndex2String ] = {};
        pathToUse[ jsonPointIndex2String ].adj = {};
        pathToUse[ jsonPointIndex2String ].adj[ jsonPointIndex1String ] = pointsDistance;      
        pathToUse[ jsonPointIndex2String ].pos = [ x2, 0, z2 ];
        }
    }


function createPathFromSVG_removeDuplicatePoints ( pathToUse, pathToUseLength ) {
    // removing duplicates
    var nodesToDeleteList = [];
    for ( var k=1; k<(pathToUseLength+1); k++ ) {
        var kString = k.toString();
        // first I had to research the deleted list to control if the k node is one of the deleted
        var deletedNode = false;
        for ( var dn=0; dn<nodesToDeleteList.length; dn++ ) 
            if ( nodesToDeleteList[dn]===kString && !deletedNode ) 
                deletedNode = true;	           
        if ( !deletedNode ) {
            for (var kNext=k+1; kNext<(pathToUseLength+1); kNext++ ) {
                kNextString = kNext.toString();
                //if ( pathToUse[ kString ].pos.equals( pathToUse[ kNextString ].pos ) ) { //merge the two points
                if ( pathToUse[ kString ].pos[0]==pathToUse[ kNextString ].pos[0] && 
                	pathToUse[ kString ].pos[1]==pathToUse[ kNextString ].pos[1] && 
                	pathToUse[ kString ].pos[2]==pathToUse[ kNextString ].pos[2] ) {	
                    // get ALL adj of kNext and add them as adj of k; add k as their adj; delete kNext as adj from his adj
                    for ( var c in pathToUse[ kNextString ].adj ) {   
                        pathToUse[ kString ].adj[ c ] = pathToUse[ kNextString ].adj[ c ];
                        pathToUse[ c ].adj[ kString ] = pathToUse[ kNextString ].adj[ c ];
                        delete pathToUse[ c ].adj[ kNextString ];
                        }		                     
                    // can't delete the kNext node still, since the for length contains also this node, so I add him to a list
                    // delete pathToUse[ kNext ];
                    nodesToDeleteList.push( kNextString );
                    }
                } 
            }
        }
    // removing the nodes that are in the deleted list
    for ( var dn=0; dn<nodesToDeleteList.length; dn++ ) {
        delete pathToUse[ nodesToDeleteList[dn] ];
        }
    }


function createPathFromSVG_scalePath ( pathToUse, pathToUseLength ) {
    // not using Math.min and Math.max since I don't have the list, so I would have to scan the graph anyway
	/***  var minX = path_getMin ( pathToUse, 'x' );
	**    var maxX = path_getMax ( pathToUse, 'x' );
	**    var minZ = path_getMin ( pathToUse, 'z' );
	**    var maxZ = path_getMax ( pathToUse, 'z' );
	**    // x variation on the pathGraph made manually : 26 - -14 = 40
	**    // z variation on the pathGraph made manually : 0 - -43 = 43
	**    // I need to use this on the complete graph ( others can be only a part of the whole graph, so the 
	**		scaling will backfire )
	**    var diffX = maxX - minX;
	**    var diffZ = maxZ - minZ;
	**    var scaleX = diffX / 40; 
	**    var scaleZ = diffZ / 43;
	**    console.log ( "scaleX: " + scaleX + "  scaleZ: " + scaleZ ); // scaleX: 14.475 & scaleZ: 14.535 
	***/
    createPathFromSVG_scalePathPointsPos ( pathToUse, pathToUseLength, 14.475, 1, 14.535 );
    createPathFromSVG_scalePathPointsAdj ( pathToUse, pathToUseLength );
    } 


function createPathFromSVG_scalePathPointsPos ( pathToUse, pathToUseLength, scaleX, scaleY, scaleZ ) {
    for ( var i=1; i<(pathToUseLength+1); i++ ) {
        var iString = i.toString();
        pathToUse[ iString ].pos[0] = Math.round( pathToUse[ iString ].pos[0]/scaleX );
        pathToUse[ iString ].pos[1] = Math.round( pathToUse[ iString ].pos[1]/scaleY );
        pathToUse[ iString ].pos[2] = Math.round( pathToUse[ iString ].pos[2]/scaleZ );
        }
    }


function createPathFromSVG_scalePathPointsAdj ( pathToUse, pathToUseLength ) {
    for ( var i=1; i<(pathToUseLength+1); i++ ) {
        var iString = i.toString();
        for ( var a in pathToUse[ iString ].adj ) {
            var x1 = pathToUse[ iString ].pos[0];
            var x2 = pathToUse[ a ].pos[0];
            var z1 = pathToUse[ iString ].pos[2];
            var z2 = pathToUse[ a ].pos[2];
            var pointsXDistance = x2 - x1;
            var pointsZDistance = z2 - z1;
            var pointsDistance = Math.sqrt( Math.pow( pointsXDistance, 2 ) + Math.pow( pointsZDistance, 2 ) );
            pathToUse[ iString ].adj[ a ] = pointsDistance;
            }
        }
    }


function createPathFromSVG_translatePointsPos ( pathToUse, pathToUseLength, tX, tY, tZ ) {
	for ( var i=1; i<(pathToUseLength+1); i++ ) {
        var iString = i.toString();
        pathToUse[ iString ].pos[0] = pathToUse[ iString ].pos[0] + tX;
        pathToUse[ iString ].pos[1] = pathToUse[ iString ].pos[1] + tY;
        pathToUse[ iString ].pos[2] = pathToUse[ iString ].pos[2] + tZ;
    	}
	}


function displayPathOnConsole () {
	console.log ( "var path = {" );
	//var pathLength = Object.keys(path).length;
    //for ( var k=1; k<(pathLength + 1); k++ ) {
    for ( var kString in path ) {	
    	//var kString = k.toString();
    	console.log ( "'" + kString + "' {" );
    	var adjString = "   adj: { ";
    	for ( var a in path[ kString ].adj ) {
	   		adjString = adjString + "'" + a + "'" + ": " + path[ kString ].adj[a] + " ";
    		}
    	console.log ( adjString + "}," );	
    	console.log ( "   pos: [" + path[ kString ].pos[0] + ", " + path[ kString ].pos[1] + ", " + path[ kString ].pos[2] + "] }" );
	   	}
    console.log ( "}" );	
	}


/*function path_getMax ( pathToUse, whichMax ) {
    var pathLength = Object.keys(pathToUse).length;
    var max;
    var max2;
    if ( whichMax==='x' )
        max = pathToUse[ '1' ].pos[0];
    else 
        max = pathToUse[ '1' ].pos[2];  
    for ( var i=1; i<(pathLength+1); i++ ) {
        iString = i.toString();
        if ( whichMax==='x' )
            max2 = pathToUse[ iString ].pos[0];
        else 
            max2 = pathToUse[ iString ].pos[2];
        if ( max2 > max )
            max = max2;
        }
    return max;    
    }*/


/*function path_getMin ( pathToUse, whichMin ) {
    var pathLength = Object.keys(pathToUse).length;
    var min;
    var min2;
    if ( whichMin==='x' )
        min = pathToUse[ '1' ].pos[0];
    else 
        min = pathToUse[ '1' ].pos[2];  
    for ( var i=1; i<(pathLength+1); i++ ) {
        iString = i.toString();
        if ( whichMin==='x' )
            min2 = pathToUse[ iString ].pos[0];
        else 
            min2 = pathToUse[ iString ].pos[2];
        if ( min2 < min )
            min = min2;
        }
    return min;    
    }*/   


function path_getSegments ( pathToUse ) {
    var segments = [];
    for ( var p1 in pathToUse ) {
        for ( var p2 in pathToUse[ p1 ].adj ) {
            var p1_p2_inSegments = false;
            for ( var s=0; s<segments.length; s++ )
                if ( segments[s][0]===p2 && segments[s][1]===p1 )
                    p1_p2_inSegments = true; 
            if ( !p1_p2_inSegments ) {
                var miniSeg = [];
                miniSeg.push( p1 );
                miniSeg.push( p2 );
                segments.push( miniSeg );
                }
            }
        }
        return segments;
    }     