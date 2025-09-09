-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 09, 2025 at 10:16 AM
-- Server version: 10.1.21-MariaDB
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `management_issue`
--

-- --------------------------------------------------------

--
-- Table structure for table `concerns`
--

CREATE TABLE `concerns` (
  `id` int(11) NOT NULL,
  `concerns` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `concerns`
--

INSERT INTO `concerns` (`id`, `concerns`, `createdAt`, `updatedAt`) VALUES
(1, 'Hardware', '2025-05-19 01:19:34', '2025-05-19 01:19:34'),
(2, 'Software', '2025-05-19 01:19:39', '2025-05-19 01:19:39'),
(3, 'Network/Internet Connection', '2025-05-19 01:19:56', '2025-05-19 01:19:56'),
(4, 'Format Pc / Backup Files', '2025-05-19 01:20:08', '2025-05-19 01:20:08'),
(5, 'Virus Detection', '2025-05-19 01:20:17', '2025-05-19 01:20:17'),
(6, 'File Sharing / Recovery', '2025-05-19 01:20:30', '2025-05-19 01:20:30'),
(7, 'Printer Problem', '2025-05-19 01:20:38', '2025-05-19 01:20:38'),
(8, 'Email Problem', '2025-05-19 01:20:46', '2025-05-19 01:20:46'),
(9, 'Cabling', '2025-05-19 01:20:55', '2025-05-19 01:20:55'),
(10, 'Coaching', '2025-05-19 01:20:59', '2025-05-19 01:20:59'),
(11, 'Hardware & Software Problem', '2025-05-19 01:22:33', '2025-05-19 01:22:33'),
(12, 'Website Posting', '2025-08-05 05:42:43', '2025-08-05 05:42:43');

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text,
  `user` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`id`, `action`, `details`, `user`, `createdAt`, `updatedAt`) VALUES
(14, 'CREATE', 'Created New Issue', 'Admin', '2025-05-19 01:20:46', '2025-05-19 01:20:46'),
(15, 'CREATE', 'Created New Issue', 'Admin', '2025-05-19 01:20:55', '2025-05-19 01:20:55'),
(16, 'CREATE', 'Created New Issue', 'Admin', '2025-05-19 01:20:59', '2025-05-19 01:20:59'),
(17, 'CREATE', 'Created New Issue', 'Admin', '2025-05-19 01:22:34', '2025-05-19 01:22:34'),
(18, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:22:42', '2025-05-19 01:22:42'),
(19, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:22:47', '2025-05-19 01:22:47'),
(20, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:22:53', '2025-05-19 01:22:53'),
(21, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:22:56', '2025-05-19 01:22:56'),
(22, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:23:02', '2025-05-19 01:23:02'),
(23, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:23:06', '2025-05-19 01:23:06'),
(24, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:23:10', '2025-05-19 01:23:10'),
(25, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:23:18', '2025-05-19 01:23:18'),
(26, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:23:22', '2025-05-19 01:23:22'),
(27, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:23:27', '2025-05-19 01:23:27'),
(28, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 01:23:30', '2025-05-19 01:23:30'),
(29, 'UPDATE', 'Successfully Updated the Status of Request', 'Admin', '2025-05-19 01:26:33', '2025-05-19 01:26:33'),
(30, 'UPDATE', 'Successfully Updated the Status of Request', 'Sison', '2025-05-19 01:30:06', '2025-05-19 01:30:06'),
(31, 'UPDATE', 'Successfully Updated the Status of Request', 'Sison', '2025-05-19 01:30:16', '2025-05-19 01:30:16'),
(32, 'UPDATE', 'Successfully Updated the Status of Request', 'Sison', '2025-05-19 01:30:57', '2025-05-19 01:30:57'),
(33, 'CREATE', 'Created New Account', 'Sison', '2025-05-19 01:33:38', '2025-05-19 01:33:38'),
(34, 'CREATE', 'Create New Workgroup', 'Admin', '2025-05-19 08:29:37', '2025-05-19 08:29:37'),
(35, 'UPDATE', 'Successfully Updated the Status of Request', 'Admin', '2025-05-19 08:30:35', '2025-05-19 08:30:35'),
(36, 'DELETE', 'Deleted User Account', 'Admin', '2025-05-21 03:33:25', '2025-05-21 03:33:25'),
(37, 'CREATE', 'Created New Account', 'Admin', '2025-05-21 03:34:04', '2025-05-21 03:34:04'),
(38, 'DELETE', 'Soft Deleted Request', 'Admin', '2025-05-21 07:23:25', '2025-05-21 07:23:25'),
(39, 'UPDATE', 'Updated the Request', 'Admin', '2025-05-22 05:41:11', '2025-05-22 05:41:11'),
(40, 'UPDATE', 'Updated the Request', 'Admin', '2025-05-30 05:37:13', '2025-05-30 05:37:13'),
(41, 'UPDATE', 'Updated the Request', 'Admin', '2025-07-15 03:46:22', '2025-07-15 03:46:22'),
(42, 'DELETE', 'Soft Deleted Request', 'Admin', '2025-07-15 03:46:26', '2025-07-15 03:46:26'),
(43, 'CREATE', 'Create New Workgroup', 'Admin', '2025-08-01 08:41:52', '2025-08-01 08:41:52'),
(44, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-01 08:44:12', '2025-08-01 08:44:12'),
(45, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-01 08:47:52', '2025-08-01 08:47:52'),
(46, 'DELETE', 'Deleted IT Personnel', 'Admin', '2025-08-01 08:50:36', '2025-08-01 08:50:36'),
(47, 'DELETE', 'Deleted IT Personnel', 'Admin', '2025-08-01 08:50:39', '2025-08-01 08:50:39'),
(48, 'CREATE', 'Created IT Personnel', 'Admin', '2025-08-01 08:50:44', '2025-08-01 08:50:44'),
(49, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-01 08:51:57', '2025-08-01 08:51:57'),
(50, 'DELETE', 'Soft Deleted Request', 'Admin', '2025-08-01 08:52:43', '2025-08-01 08:52:43'),
(51, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-01 08:55:23', '2025-08-01 08:55:23'),
(52, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-01 09:04:32', '2025-08-01 09:04:32'),
(53, 'UPDATE', 'Updated the Request', 'Admin', '2025-08-05 05:37:49', '2025-08-05 05:37:49'),
(54, 'DELETE', 'Soft Deleted Request', 'Admin', '2025-08-05 05:38:13', '2025-08-05 05:38:13'),
(55, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-05 05:40:58', '2025-08-05 05:40:58'),
(56, 'CREATE', 'Created New Issue', 'Admin', '2025-08-05 05:42:43', '2025-08-05 05:42:43'),
(57, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-05 05:44:49', '2025-08-05 05:44:49'),
(58, 'UPDATE', 'Updated the Request', 'Admin', '2025-08-05 05:45:27', '2025-08-05 05:45:27'),
(59, 'UPDATE', 'Updated the Request', 'Admin', '2025-08-05 05:45:42', '2025-08-05 05:45:42'),
(60, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-05 05:49:44', '2025-08-05 05:49:44'),
(61, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-05 05:56:46', '2025-08-05 05:56:46'),
(62, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-05 06:03:55', '2025-08-05 06:03:55'),
(63, 'CREATE', 'Created New Data Entries', 'Admin', '2025-08-05 06:06:57', '2025-08-05 06:06:57');

-- --------------------------------------------------------

--
-- Table structure for table `monitorings`
--

CREATE TABLE `monitorings` (
  `id` int(11) NOT NULL,
  `workgroup` varchar(255) NOT NULL,
  `requestedby` varchar(255) NOT NULL,
  `issue` varchar(255) NOT NULL,
  `controlno` varchar(255) DEFAULT NULL,
  `serviceby` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `repairDone` varchar(255) DEFAULT NULL,
  `fileUrl` varchar(255) DEFAULT NULL,
  `monthId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `monitorings`
--

INSERT INTO `monitorings` (`id`, `workgroup`, `requestedby`, `issue`, `controlno`, `serviceby`, `status`, `repairDone`, `fileUrl`, `monthId`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(2, 'BAC', 'Alegria', 'Website Posting', '2024-71', 'IT Staff', 'Completed', '', NULL, 21, '2024-09-05 09:40:00', '2025-09-05 09:40:00', NULL),
(3, 'BAC', 'Alegria', 'Website Posting', '2024-70', 'IT Staff', 'Completed', '', NULL, 21, '2024-09-13 09:40:00', '2024-09-13 09:41:00', NULL),
(4, 'BAC', 'Alegria', 'Website Posting', '2024-69', 'IT Staff', 'Completed', NULL, NULL, 20, '2024-08-28 09:11:00', '2024-08-28 09:15:00', NULL),
(5, 'BAC', 'Alegria', 'Website Posting', '2024-68', 'IT Staff', 'Completed', NULL, NULL, 20, '2024-08-21 09:00:00', '2024-08-21 09:10:00', NULL),
(10, 'BAC', 'Alegria', 'Website Posting', '2024-67', 'IT Staff', 'Completed', NULL, NULL, 20, '2024-08-08 09:05:00', '2024-08-05 09:05:00', NULL),
(11, 'FSG', 'Denise', 'Website Posting', '2024-09', 'IT Christine', 'Completed', NULL, NULL, 20, '2024-08-08 01:00:00', '2024-08-08 01:52:00', NULL),
(12, 'BAC', 'Alegria', 'Website Posting', '2024-18', 'IT Christine', 'Completed', NULL, NULL, 20, '2024-08-05 08:35:00', '2024-08-05 08:45:00', NULL),
(13, 'BAC', 'Alegria', 'Website Posting', '2024-07', 'IT Christine', 'Completed', NULL, NULL, 20, '2024-08-01 08:11:00', '2024-08-01 08:30:00', NULL),
(14, 'BAC', 'Alegria', 'Website Posting', '2024-08', 'IT Christine', 'Completed', NULL, NULL, 19, '2024-07-30 09:43:00', '2024-07-31 01:59:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `months`
--

CREATE TABLE `months` (
  `id` int(11) NOT NULL,
  `month` varchar(255) NOT NULL,
  `yearId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `months`
--

INSERT INTO `months` (`id`, `month`, `yearId`, `createdAt`, `updatedAt`) VALUES
(1, 'January', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(2, 'February', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(3, 'March', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(4, 'April', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(5, 'May', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(6, 'June', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(7, 'July', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(8, 'August', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(9, 'September', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(10, 'October', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(11, 'November', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(12, 'December', 1, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(13, 'January', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(14, 'February', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(15, 'March', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(16, 'April', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(17, 'May', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(18, 'June', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(19, 'July', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(20, 'August', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(21, 'September', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(22, 'October', 2, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(23, 'November', 2, '2025-05-19 01:18:10', '2025-05-19 01:18:10'),
(24, 'December', 2, '2025-05-19 01:18:10', '2025-05-19 01:18:10'),
(25, 'January', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(26, 'February', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(27, 'March', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(28, 'April', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(29, 'May', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(30, 'June', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(31, 'July', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(32, 'August', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(33, 'September', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(34, 'October', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(35, 'November', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20'),
(36, 'December', 3, '2025-05-19 01:18:20', '2025-05-19 01:18:20');

-- --------------------------------------------------------

--
-- Table structure for table `personnels`
--

CREATE TABLE `personnels` (
  `id` int(11) NOT NULL,
  `personnels` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `personnels`
--

INSERT INTO `personnels` (`id`, `personnels`, `createdAt`, `updatedAt`) VALUES
(1, 'IT Aldwin', '2025-05-19 01:18:44', '2025-05-19 01:18:44'),
(2, 'IT Sison', '2025-05-19 01:18:49', '2025-05-19 01:18:49'),
(3, 'IT Mark', '2025-05-19 01:18:59', '2025-05-19 01:18:59'),
(5, 'IT Christine', '2025-05-19 01:19:12', '2025-05-19 01:19:12'),
(7, 'IT Staff', '2025-08-01 08:50:44', '2025-08-01 08:50:44');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `username`, `mobile`, `password`, `createdAt`, `updatedAt`) VALUES
(1, NULL, NULL, 'sisonjohnalbert0422@gmail.com', 'Sison', NULL, '$2b$10$5RsjkN5kdYKgl6173tvB5ue1OzP6kZheL7WpxftPqF7wKjRN3WRtO', '2025-05-16 06:20:19', '2025-05-16 06:20:19'),
(0, NULL, NULL, 'admin@ndc.gov.ph', 'Admin', NULL, '$2b$10$TYQvq5pkoQI2UjQXK42ACu9SbfjP6NUzvaEr0JAQJ..cf5azL58fu', '2025-05-21 03:34:04', '2025-05-21 03:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `workgroups`
--

CREATE TABLE `workgroups` (
  `id` int(11) NOT NULL,
  `workgroups` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `workgroups`
--

INSERT INTO `workgroups` (`id`, `workgroups`, `createdAt`, `updatedAt`) VALUES
(1, 'AMG', '2025-05-19 01:22:42', '2025-05-19 01:22:42'),
(2, 'BDG', '2025-05-19 01:22:46', '2025-05-19 01:22:46'),
(3, 'CCG', '2025-05-19 01:22:53', '2025-05-19 01:22:53'),
(4, 'CPD', '2025-05-19 01:22:56', '2025-05-19 01:22:56'),
(5, 'FAD', '2025-05-19 01:23:02', '2025-05-19 01:23:02'),
(6, 'FSG', '2025-05-19 01:23:06', '2025-05-19 01:23:06'),
(7, 'FMG', '2025-05-19 01:23:10', '2025-05-19 01:23:10'),
(8, 'IAO', '2025-05-19 01:23:18', '2025-05-19 01:23:18'),
(9, 'LEGAL', '2025-05-19 01:23:22', '2025-05-19 01:23:22'),
(10, 'OGM', '2025-05-19 01:23:27', '2025-05-19 01:23:27'),
(11, 'SPG', '2025-05-19 01:23:30', '2025-05-19 01:23:30'),
(12, 'BAC', '2025-05-19 08:29:37', '2025-05-19 08:29:37'),
(13, 'CSG', '2025-08-01 08:41:52', '2025-08-01 08:41:52');

-- --------------------------------------------------------

--
-- Table structure for table `years`
--

CREATE TABLE `years` (
  `id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `years`
--

INSERT INTO `years` (`id`, `year`, `createdAt`, `updatedAt`) VALUES
(1, 2025, '2025-05-19 01:17:55', '2025-05-19 01:17:55'),
(2, 2024, '2025-05-19 01:18:09', '2025-05-19 01:18:09'),
(3, 2023, '2025-05-19 01:18:20', '2025-05-19 01:18:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `concerns`
--
ALTER TABLE `concerns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `monitorings`
--
ALTER TABLE `monitorings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `monthId` (`monthId`);

--
-- Indexes for table `months`
--
ALTER TABLE `months`
  ADD PRIMARY KEY (`id`),
  ADD KEY `yearId` (`yearId`);

--
-- Indexes for table `personnels`
--
ALTER TABLE `personnels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `workgroups`
--
ALTER TABLE `workgroups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `years`
--
ALTER TABLE `years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `year` (`year`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `concerns`
--
ALTER TABLE `concerns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;
--
-- AUTO_INCREMENT for table `monitorings`
--
ALTER TABLE `monitorings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
--
-- AUTO_INCREMENT for table `months`
--
ALTER TABLE `months`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
--
-- AUTO_INCREMENT for table `personnels`
--
ALTER TABLE `personnels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `workgroups`
--
ALTER TABLE `workgroups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
--
-- AUTO_INCREMENT for table `years`
--
ALTER TABLE `years`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `monitorings`
--
ALTER TABLE `monitorings`
  ADD CONSTRAINT `monitorings_ibfk_1` FOREIGN KEY (`monthId`) REFERENCES `months` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `months`
--
ALTER TABLE `months`
  ADD CONSTRAINT `months_ibfk_1` FOREIGN KEY (`yearId`) REFERENCES `years` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
