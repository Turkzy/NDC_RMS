-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2025 at 10:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `concerns`
--

INSERT INTO `concerns` (`id`, `concerns`, `createdAt`, `updatedAt`) VALUES
(19, 'Hardware', '2025-04-28 02:47:38', '2025-04-28 02:47:38'),
(20, 'Software', '2025-04-28 02:47:43', '2025-04-28 02:47:43'),
(21, 'Network/Internet Connection', '2025-04-28 02:48:00', '2025-04-28 02:48:00'),
(22, 'Format Pc / Backup Files', '2025-04-28 02:48:33', '2025-04-28 02:48:33'),
(23, 'Virus Details', '2025-04-28 02:48:44', '2025-04-28 02:48:44'),
(24, 'File Sharing / Recovery', '2025-04-28 02:48:56', '2025-04-28 02:48:56'),
(25, 'Printer Problem', '2025-04-28 02:49:10', '2025-04-28 02:49:10'),
(26, 'Email Problem', '2025-04-28 02:49:19', '2025-04-28 02:49:19'),
(27, 'Cabling', '2025-04-28 02:49:27', '2025-04-28 02:49:27'),
(28, 'Coaching', '2025-04-28 02:49:34', '2025-04-28 02:49:34'),
(30, 'Hardware and Software Problem / Installation', '2025-04-30 07:27:16', '2025-04-30 07:27:16');

-- --------------------------------------------------------

--
-- Table structure for table `monitorings`
--

CREATE TABLE `monitorings` (
  `id` int(11) NOT NULL,
  `workgroup` varchar(255) NOT NULL,
  `requestedby` varchar(255) NOT NULL,
  `issue` varchar(255) NOT NULL,
  `controlno` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `repairDone` varchar(255) DEFAULT NULL,
  `monthId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monitorings`
--

INSERT INTO `monitorings` (`id`, `workgroup`, `requestedby`, `issue`, `controlno`, `status`, `repairDone`, `monthId`, `createdAt`, `updatedAt`) VALUES
(1, 'FMG', 'Sison', 'sdfsdf', '2025-109', 'Pending', NULL, 4, '2025-04-30 07:10:15', '2025-04-30 07:10:15'),
(2, 'CCG', 'John', 'Format Pc / Backup Files', '2025-110', 'Pending', NULL, 4, '2025-04-30 08:14:49', '2025-04-30 08:14:49'),
(3, 'AMG', 'John', 'Software', '2025-111', 'Pending', NULL, 4, '2025-04-30 08:15:49', '2025-04-30 08:15:49'),
(4, 'FSG', 'fghfghfgh', 'ewan ko', '2025-112', 'Pending', NULL, 4, '2025-04-30 08:41:45', '2025-04-30 08:41:45');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `months`
--

INSERT INTO `months` (`id`, `month`, `yearId`, `createdAt`, `updatedAt`) VALUES
(1, 'January', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(2, 'February', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(3, 'March', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(4, 'April', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(5, 'May', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(6, 'June', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(7, 'July', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(8, 'August', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(9, 'September', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(10, 'October', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(11, 'November', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06'),
(12, 'December', 1, '2025-04-30 07:10:06', '2025-04-30 07:10:06');

-- --------------------------------------------------------

--
-- Table structure for table `workgroups`
--

CREATE TABLE `workgroups` (
  `id` int(11) NOT NULL,
  `workgroups` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workgroups`
--

INSERT INTO `workgroups` (`id`, `workgroups`, `createdAt`, `updatedAt`) VALUES
(1, 'BDG', '2025-04-28 03:20:39', '2025-04-28 03:28:00'),
(3, 'AMG', '2025-04-28 05:44:28', '2025-04-28 05:44:28'),
(4, 'CCG', '2025-04-28 05:45:32', '2025-04-28 05:45:32'),
(5, 'CPD', '2025-04-28 05:46:40', '2025-04-28 05:46:40'),
(6, 'FAD', '2025-04-28 05:46:45', '2025-04-28 05:46:45'),
(7, 'FSG', '2025-04-28 05:46:50', '2025-04-28 05:46:50'),
(8, 'FMG', '2025-04-28 05:46:53', '2025-04-28 05:46:53'),
(9, 'IAO', '2025-04-28 05:47:16', '2025-04-28 05:47:16'),
(10, 'LEGAL', '2025-04-28 05:47:22', '2025-04-28 05:47:22'),
(11, 'OGM', '2025-04-28 05:47:26', '2025-04-28 05:47:26'),
(12, 'SPG', '2025-04-28 05:47:32', '2025-04-28 05:47:32');

-- --------------------------------------------------------

--
-- Table structure for table `years`
--

CREATE TABLE `years` (
  `id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `years`
--

INSERT INTO `years` (`id`, `year`, `createdAt`, `updatedAt`) VALUES
(1, 2025, '2025-04-30 07:10:06', '2025-04-30 07:10:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `concerns`
--
ALTER TABLE `concerns`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `monitorings`
--
ALTER TABLE `monitorings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `months`
--
ALTER TABLE `months`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `workgroups`
--
ALTER TABLE `workgroups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `years`
--
ALTER TABLE `years`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
