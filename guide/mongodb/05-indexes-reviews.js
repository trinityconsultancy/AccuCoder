// Reviews Collection Indexes
// Adds performance indexes to existing Reviews collection

print("Adding indexes to Reviews collection...");

try {
  // Index on status for filtering (pending/approved/rejected)
  db.reviews.createIndex(
    { status: 1 },
    { name: "status_idx" }
  );
  print("✓ Status index created");
} catch (e) {
  print("⚠ Status index may already exist: " + e.message);
}

try {
  // Index on createdAt for sorting by date
  db.reviews.createIndex(
    { createdAt: -1 },
    { name: "createdAt_idx" }
  );
  print("✓ Created at index created");
} catch (e) {
  print("⚠ Created at index may already exist: " + e.message);
}

try {
  // Index on rating for filtering by rating
  db.reviews.createIndex(
    { rating: 1 },
    { name: "rating_idx" }
  );
  print("✓ Rating index created");
} catch (e) {
  print("⚠ Rating index may already exist: " + e.message);
}

try {
  // Index on moderatedBy for admin queries
  db.reviews.createIndex(
    { moderatedBy: 1 },
    { name: "moderatedBy_idx" }
  );
  print("✓ Moderated by index created");
} catch (e) {
  print("⚠ Moderated by index may already exist: " + e.message);
}

try {
  // Compound index for moderation queue (most common query)
  db.reviews.createIndex(
    { status: 1, createdAt: -1 },
    { name: "status_createdAt_idx" }
  );
  print("✓ Status + created at compound index created");
} catch (e) {
  print("⚠ Compound index may already exist: " + e.message);
}

print("✓ Reviews indexes setup complete\n");

// Show all indexes
print("Current indexes on Reviews collection:");
db.reviews.getIndexes().forEach(function(idx) {
  print("  • " + idx.name);
});
