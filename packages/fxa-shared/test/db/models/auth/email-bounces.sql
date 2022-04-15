CREATE TABLE `emailBounces` (
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `emailTypeId` tinyint unsigned DEFAULT NULL,
  `bounceType` tinyint(3) unsigned NOT NULL,
  `bounceSubType` tinyint(3) unsigned NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `diagnosticCode` varchar(255) NOT NULL,
  PRIMARY KEY (`email`,`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
