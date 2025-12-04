// Users Collection Indexes
// Adds performance indexes to existing Users collection

print("Adding indexes to Users collection...");

try {
  // Unique index on email (prevents duplicate accounts)
  db.users.createIndex(
    { email: 1 },
    { unique: true, name: "email_unique_idx" }
  );
  print("✓ Email unique index created");
} catch (e) {
  print("⚠ Email index may already exist: " + e.message);
}

try {
  // Index on role for admin queries
  db.users.createIndex(
    { role: 1 },
    { name: "role_idx" }
  );
  print("✓ Role index created");
} catch (e) {
  print("⚠ Role index may already exist: " + e.message);
}

try {
  // Index on emailVerified for filtering verified users
  db.users.createIndex(
    { emailVerified: 1 },
    { name: "emailVerified_idx" }
  );
  print("✓ Email verified index created");
} catch (e) {
  print("⚠ Email verified index may already exist: " + e.message);
}

try {
  // Index on createdAt for sorting by registration date
  db.users.createIndex(
    { createdAt: -1 },
    { name: "createdAt_idx" }
  );
  print("✓ Created at index created");
} catch (e) {
  print("⚠ Created at index may already exist: " + e.message);
}

print("✓ Users indexes setup complete\n");

// Show all indexes
print("Current indexes on Users collection:");
db.users.getIndexes().forEach(function(idx) {
  var unique = idx.unique ? " (unique)" : "";
  print("  • " + idx.name + unique);
});
