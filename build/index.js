const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const rimraf = require("rimraf");

// create a file to stream archive data to.
const dist = path.join(__dirname, '../dist');
const src = path.join(__dirname, '../src');

if (fs.existsSync(dist)) { rimraf.sync(dist); }
fs.mkdirSync(dist);

const output = fs.createWriteStream(path.join(dist, 'Spawncraft.mcpack'));
const archive = archiver('zip', { zlib: { level: 9 } });

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log('Archiver has been finalized and the output file descriptor has closed.');
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function () {
  console.log('Data has been drained');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on('error', function (err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
archive.directory(src, false);

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();