
/* 
  BSD License:
  
  CHISSL: Interactive Machine Learning
  
  Copyright © 2018, Battelle Memorial Institute
  
  All rights reserved.
  
  1. Battelle Memorial Institute (hereinafter Battelle) hereby grants permission
     to any person or entity lawfully obtaining a copy of this software and
     associated documentation files (hereinafter “the Software”) to redistribute
     and use the Software in source and binary forms, with or without 
     modification.  Such person or entity may use, copy, modify, merge, publish,
     distribute, sublicense, and/or sell copies of the Software, and may permit
     others to do so, subject to the following conditions:
     * Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimers.
     * Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
     * Other than as used herein, neither the name Battelle Memorial Institute
       or Battelle may be used in any form whatsoever without the express
       written consent of Battelle. 
  
  2. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
     THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
     PURPOSEARE DISCLAIMED. IN NO EVENT SHALL BATTELLE OR CONTRIBUTORS BE LIABLE
     FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
     DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
     CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
     LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
     OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
     DAMAGE.
     
*/


export function getSubGroups(parents, classes, sizes, numSplits=5) {
  parents = [...parents];

  const splitCounts = {};

  // build a nested structure containing only the instances
  for (let source = parents.length - 1; source >= 0; source--) {
    const label = classes[source];
    const sc = splitCounts[label] || 0;

    // Cases where it's OK to split
    //   its big enough (instances aren't)
    //   it's not the unlabeled class
    //   we haven't split too much already
    if (sizes[source] > 5 && label !== -1 && sc < numSplits) {
      splitCounts[label] = sc + 1;
    } else {
      // propagate the root
      parents[source] = parents[parents[source]];
    }
  }

  return parents;
}

export function applyLabel({parents, costs}, classes, distances, source, label) {

  const t = new Date();
  console.log(source, '->', label)

  let next;
  let dp;

  classes[source] = label;
  distances[source] = 0;

  // walk up the tree
  // starting at the source
  // propagating the label and distances

  while ((next = parents[source]) !== source && (dp = distances[source] + costs[source]) < distances[next]) {
    distances[next] = dp;
    classes[next] = label;
    source = next;
  }

  // walk down the entire tree backwards
  // starting at the root
  // propagating the label and distances

  for (source = parents.length - 2; source >= 0; source--) {
    next = parents[source];
    dp = distances[next] + costs[source];
    
    if (dp < distances[source]) {
      distances[source] = dp;
      classes[source] = classes[next];
    }
  }

  console.log(new Date() - t, '(ms)')
}

