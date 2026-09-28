-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2026 at 07:22 PM
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
-- Database: `greenhouse_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `actuator_current_status`
--

CREATE TABLE `actuator_current_status` (
  `id` int(11) NOT NULL,
  `device` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'OFF',
  `mode` varchar(20) NOT NULL DEFAULT 'AUTO',
  `value` float DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `actuator_current_status`
--

INSERT INTO `actuator_current_status` (`id`, `device`, `status`, `mode`, `value`, `updated_at`) VALUES
(1, 'water_pump', 'OFF', 'AUTO', NULL, '2026-09-27 18:09:57'),
(2, 'cooling_fan', 'OFF', 'AUTO', NULL, '2026-09-27 18:09:58'),
(3, 'ventilation_fan', 'OFF', 'AUTO', NULL, '2026-09-27 18:09:58'),
(4, 'shade_motor', 'OFF', 'AUTO', 0, '2026-09-23 18:05:20'),
(5, 'light', 'ON', 'AUTO', NULL, '2026-09-27 18:09:59');

-- --------------------------------------------------------

--
-- Table structure for table `actuator_logs`
--

CREATE TABLE `actuator_logs` (
  `id` int(11) NOT NULL,
  `device` varchar(50) NOT NULL,
  `action` varchar(30) NOT NULL,
  `mode` varchar(20) NOT NULL DEFAULT 'MANUAL',
  `value` float DEFAULT NULL,
  `source` varchar(50) NOT NULL DEFAULT 'dashboard',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `actuator_logs`
--

INSERT INTO `actuator_logs` (`id`, `device`, `action`, `mode`, `value`, `source`, `created_at`) VALUES
(304, 'light', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:01:15'),
(305, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:01:20'),
(306, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:01:22'),
(307, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:01:26'),
(308, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:01:28'),
(309, 'cooling_fan', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:01:32'),
(310, 'ventilation_fan', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:01:33'),
(311, 'light', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:01:39'),
(312, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:09:27'),
(313, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:10:40'),
(314, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:10:43'),
(315, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:10:58'),
(316, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:11:02'),
(317, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:12:36'),
(318, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:12:43'),
(319, 'cooling_fan', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:12:50'),
(320, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:04'),
(321, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:11'),
(322, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:12'),
(323, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:14'),
(324, 'light', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:20'),
(325, 'light', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:14:23'),
(326, 'light', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:26'),
(327, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:32'),
(328, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:37'),
(329, 'light', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:14:39'),
(330, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:14:42'),
(331, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:15:28'),
(332, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:17:01'),
(333, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:17:10'),
(334, 'cooling_fan', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:17:20'),
(335, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:17:48'),
(336, 'light', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:18:01'),
(337, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:18:46'),
(338, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:19:25'),
(339, 'cooling_fan', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:19:26'),
(340, 'light', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:19:33'),
(341, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:20:06'),
(342, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:22:51'),
(343, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:22:55'),
(344, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:22:57'),
(345, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:22:59'),
(346, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:23:07'),
(347, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:23:08'),
(348, 'light', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:23:10'),
(349, 'light', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:23:12'),
(350, 'light', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:23:13'),
(351, 'light', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:23:15'),
(352, 'cooling_fan', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:23:19'),
(353, 'light', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:42:34'),
(354, 'light', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:42:36'),
(355, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:42:38'),
(356, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:42:41'),
(357, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:43:08'),
(358, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:43:13'),
(359, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:43:15'),
(360, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:55:16'),
(361, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 16:55:18'),
(362, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 16:55:50'),
(363, 'water_pump', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 17:16:31'),
(364, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 17:16:48'),
(365, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 17:16:57'),
(366, 'cooling_fan', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 17:17:05'),
(367, 'light', 'ON', 'MANUAL', NULL, 'dashboard', '2026-09-27 17:17:14'),
(368, 'cooling_fan', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 17:19:14'),
(369, 'water_pump', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 17:19:15'),
(370, 'light', 'AUTO', 'AUTO', NULL, 'dashboard', '2026-09-27 17:19:47'),
(371, 'water_pump', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 17:19:52'),
(372, 'ventilation_fan', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 17:19:53'),
(373, 'cooling_fan', 'OFF', 'MANUAL', NULL, 'dashboard', '2026-09-27 17:19:53');

-- --------------------------------------------------------

--
-- Table structure for table `automation_settings`
--

CREATE TABLE `automation_settings` (
  `id` int(11) NOT NULL,
  `soil_min` float NOT NULL DEFAULT 30,
  `soil_max` float NOT NULL DEFAULT 70,
  `temperature_low` float NOT NULL DEFAULT 30,
  `temperature_high` float NOT NULL DEFAULT 35,
  `humidity_high` float NOT NULL DEFAULT 90,
  `light_threshold` float NOT NULL DEFAULT 800,
  `air_quality_threshold` float NOT NULL DEFAULT 70,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `automation_settings`
--

INSERT INTO `automation_settings` (`id`, `soil_min`, `soil_max`, `temperature_low`, `temperature_high`, `humidity_high`, `light_threshold`, `air_quality_threshold`, `updated_at`) VALUES
(1, 30, 70, 25, 35, 90, 800, 70, '2026-09-26 19:03:37');

-- --------------------------------------------------------

--
-- Table structure for table `sensor_readings`
--

CREATE TABLE `sensor_readings` (
  `id` int(11) NOT NULL,
  `temperature` float DEFAULT NULL,
  `humidity` float DEFAULT NULL,
  `soil_moisture` float DEFAULT NULL,
  `light` float DEFAULT NULL,
  `air_quality` float DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sensor_readings`
--

INSERT INTO `sensor_readings` (`id`, `temperature`, `humidity`, `soil_moisture`, `light`, `air_quality`, `created_at`) VALUES
(8304, 32.2, 75.4, 86, NULL, 42, '2026-09-27 17:07:48'),
(8305, 32.2, 75.2, 86, NULL, 40, '2026-09-27 17:07:48'),
(8306, 32.2, 75.1, 85, NULL, 37, '2026-09-27 17:10:29'),
(8307, 32.2, 75.1, 85, NULL, 37, '2026-09-27 17:10:29'),
(8308, 32.2, 75.1, 85, NULL, 37, '2026-09-27 17:10:29'),
(8309, 32.2, 75.1, 85, NULL, 37, '2026-09-27 17:10:31'),
(8310, 32.1, 75, 85, NULL, 38, '2026-09-27 17:10:32'),
(8311, 32.1, 75, 85, NULL, 38, '2026-09-27 17:10:34'),
(8312, 32.1, 75, 85, NULL, 38, '2026-09-27 17:10:35'),
(8313, 32.1, 75, 85, NULL, 38, '2026-09-27 17:10:37'),
(8314, 32.1, 74.8, 86, NULL, 37, '2026-09-27 17:10:38'),
(8315, 32.1, 74.8, 86, NULL, 37, '2026-09-27 17:10:40'),
(8316, 32.1, 74.8, 85, NULL, 38, '2026-09-27 17:10:41'),
(8317, 32.1, 74.8, 85, NULL, 38, '2026-09-27 17:10:43'),
(8318, 32.1, 74.6, 85, NULL, 37, '2026-09-27 17:10:44'),
(8319, 32.1, 74.8, 86, NULL, 38, '2026-09-27 17:13:55'),
(8320, 32.1, 74.8, 86, NULL, 38, '2026-09-27 17:13:57'),
(8321, 32.1, 74.8, 86, NULL, 38, '2026-09-27 17:13:57'),
(8322, 32.1, 74.7, 86, NULL, 39, '2026-09-27 17:13:58'),
(8323, 32.1, 74.7, 86, NULL, 39, '2026-09-27 17:13:58'),
(8324, 32.1, 74.5, 86, NULL, 38, '2026-09-27 17:14:01'),
(8325, 32.1, 74.5, 86, NULL, 38, '2026-09-27 17:14:01'),
(8326, 32.1, 74.4, 86, NULL, 39, '2026-09-27 17:14:04'),
(8327, 32.1, 74.4, 86, NULL, 39, '2026-09-27 17:14:05'),
(8328, 32.1, 74.6, 86, NULL, 37, '2026-09-27 17:14:07'),
(8329, 32.1, 74.6, 86, NULL, 37, '2026-09-27 17:14:07'),
(8330, 32.1, 74.5, 86, NULL, 37, '2026-09-27 17:14:10'),
(8331, 32.1, 74.5, 86, NULL, 37, '2026-09-27 17:14:10'),
(8332, 32.1, 74.6, 86, NULL, 37, '2026-09-27 17:14:13'),
(8333, 32.1, 74.6, 86, NULL, 37, '2026-09-27 17:14:14'),
(8334, 32.1, 74.4, 86, NULL, 37, '2026-09-27 17:14:16'),
(8335, 32.1, 74.4, 86, NULL, 37, '2026-09-27 17:14:16'),
(8336, 32.1, 74.4, 86, NULL, 37, '2026-09-27 17:14:19'),
(8337, 32.1, 74.4, 86, NULL, 37, '2026-09-27 17:14:20'),
(8338, 32.1, 74.4, 85, NULL, 38, '2026-09-27 17:14:22'),
(8339, 32.1, 74.4, 85, NULL, 38, '2026-09-27 17:14:23'),
(8340, 32.1, 74.4, 86, NULL, 37, '2026-09-27 17:14:25'),
(8341, 32.1, 74.4, 86, NULL, 37, '2026-09-27 17:14:26'),
(8342, 32.1, 74.6, 86, NULL, 37, '2026-09-27 17:14:28'),
(8343, 32.1, 74.6, 86, NULL, 37, '2026-09-27 17:14:29'),
(8344, 32.1, 74.5, 86, NULL, 37, '2026-09-27 17:14:31'),
(8345, 32.1, 74.5, 86, NULL, 37, '2026-09-27 17:14:32'),
(8346, 32.1, 74.8, 86, NULL, 37, '2026-09-27 17:14:34'),
(8347, 32.1, 74.8, 86, NULL, 37, '2026-09-27 17:14:35'),
(8348, 32.1, 74.8, 86, NULL, 37, '2026-09-27 17:14:40'),
(8349, 32.1, 74.8, 86, NULL, 37, '2026-09-27 17:14:41'),
(8350, 32.1, 74.6, 86, NULL, 37, '2026-09-27 17:14:43'),
(8351, 32.1, 74.6, 86, NULL, 37, '2026-09-27 17:14:44'),
(8352, 32.1, 74.8, 86, NULL, 38, '2026-09-27 17:14:46'),
(8353, 32.1, 74.5, 86, NULL, 37, '2026-09-27 17:15:09'),
(8354, 32.1, 75, 86, NULL, 37, '2026-09-27 17:15:58'),
(8355, 32, 75.1, 86, NULL, 37, '2026-09-27 17:16:14'),
(8356, 32, 75, 86, NULL, 81, '2026-09-27 17:16:29'),
(8357, 0, 0, 85, NULL, 45, '2026-09-27 17:20:00'),
(8358, 0, 0, 85, NULL, 43, '2026-09-27 17:21:01'),
(8359, 0, 0, 85, NULL, 43, '2026-09-27 17:21:09'),
(8360, 0, 0, 85, NULL, 43, '2026-09-27 17:21:43'),
(8361, 0, 0, 85, NULL, 43, '2026-09-27 17:22:31'),
(8362, 0, 0, 85, NULL, 43, '2026-09-27 17:23:44'),
(8363, 0, 0, 84, NULL, 43, '2026-09-27 17:25:30'),
(8364, 0, 0, 84, NULL, 43, '2026-09-27 17:27:12'),
(8365, 0, 0, 84, NULL, 43, '2026-09-27 17:28:35'),
(8366, 0, 0, 84, NULL, 41, '2026-09-27 17:30:35'),
(8367, 0, 0, 84, NULL, 43, '2026-09-27 17:30:35'),
(8368, 0, 0, 84, NULL, 41, '2026-09-27 17:30:37'),
(8369, 0, 0, 84, NULL, 43, '2026-09-27 17:30:40'),
(8370, 0, 0, 84, NULL, 43, '2026-09-27 17:30:40'),
(8371, 0, 0, 84, NULL, 42, '2026-09-27 17:30:41'),
(8372, 0, 0, 84, NULL, 42, '2026-09-27 17:30:43'),
(8373, 0, 0, 84, NULL, 42, '2026-09-27 17:30:44'),
(8374, 0, 0, 84, NULL, 42, '2026-09-27 17:30:46'),
(8375, 0, 0, 84, NULL, 43, '2026-09-27 17:30:47'),
(8376, 0, 0, 84, NULL, 43, '2026-09-27 17:30:49'),
(8377, 0, 0, 84, NULL, 42, '2026-09-27 17:30:50'),
(8378, 0, 0, 84, NULL, 42, '2026-09-27 17:30:52'),
(8379, 0, 0, 84, NULL, 42, '2026-09-27 17:30:53'),
(8380, 0, 0, 84, NULL, 42, '2026-09-27 17:30:55'),
(8381, 0, 0, 84, NULL, 42, '2026-09-27 17:30:56'),
(8382, 0, 0, 84, NULL, 42, '2026-09-27 17:30:58'),
(8383, 0, 0, 84, NULL, 42, '2026-09-27 17:30:59'),
(8384, 0, 0, 84, NULL, 42, '2026-09-27 17:31:01'),
(8385, 0, 0, 85, NULL, 42, '2026-09-27 17:31:02'),
(8386, 0, 0, 85, NULL, 42, '2026-09-27 17:31:04'),
(8387, 0, 0, 84, NULL, 42, '2026-09-27 17:31:05'),
(8388, 0, 0, 84, NULL, 42, '2026-09-27 17:31:07'),
(8389, 0, 0, 84, NULL, 42, '2026-09-27 17:31:08'),
(8390, 0, 0, 84, NULL, 42, '2026-09-27 17:31:10'),
(8391, 0, 0, 85, NULL, 42, '2026-09-27 17:31:11'),
(8392, 0, 0, 85, NULL, 42, '2026-09-27 17:31:13'),
(8393, 0, 0, 85, NULL, 42, '2026-09-27 17:31:14'),
(8394, 0, 0, 85, NULL, 42, '2026-09-27 17:31:16'),
(8395, 0, 0, 84, NULL, 42, '2026-09-27 17:31:17'),
(8396, 0, 0, 84, NULL, 42, '2026-09-27 17:31:19'),
(8397, 0, 0, 84, NULL, 42, '2026-09-27 17:31:20'),
(8398, 0, 0, 84, NULL, 42, '2026-09-27 17:31:22'),
(8399, 0, 0, 84, NULL, 42, '2026-09-27 17:31:23'),
(8400, 0, 0, 84, NULL, 42, '2026-09-27 17:31:25'),
(8401, 0, 0, 84, NULL, 42, '2026-09-27 17:31:26'),
(8402, 0, 0, 84, NULL, 42, '2026-09-27 17:31:28'),
(8403, 0, 0, 84, NULL, 42, '2026-09-27 17:31:29'),
(8404, 0, 0, 84, NULL, 42, '2026-09-27 17:31:31'),
(8405, 0, 0, 84, NULL, 42, '2026-09-27 17:31:32'),
(8406, 0, 0, 84, NULL, 42, '2026-09-27 17:31:35'),
(8407, 0, 0, 84, NULL, 42, '2026-09-27 17:31:35'),
(8408, 0, 0, 84, NULL, 42, '2026-09-27 17:31:37'),
(8409, 0, 0, 84, NULL, 41, '2026-09-27 17:31:38'),
(8410, 0, 0, 84, NULL, 41, '2026-09-27 17:31:40'),
(8411, 0, 0, 84, NULL, 42, '2026-09-27 17:31:44'),
(8412, 0, 0, 84, NULL, 42, '2026-09-27 17:31:45'),
(8413, 0, 0, 84, NULL, 42, '2026-09-27 17:31:46'),
(8414, 0, 0, 84, NULL, 42, '2026-09-27 17:31:47'),
(8415, 0, 0, 84, NULL, 42, '2026-09-27 17:31:49'),
(8416, 0, 0, 84, NULL, 41, '2026-09-27 17:31:50'),
(8417, 0, 0, 84, NULL, 41, '2026-09-27 17:31:52'),
(8418, 0, 0, 84, NULL, 41, '2026-09-27 17:31:53'),
(8419, 0, 0, 84, NULL, 41, '2026-09-27 17:31:55'),
(8420, 0, 0, 84, NULL, 41, '2026-09-27 17:31:56'),
(8421, 0, 0, 84, NULL, 41, '2026-09-27 17:31:58'),
(8422, 0, 0, 84, NULL, 41, '2026-09-27 17:31:59'),
(8423, 0, 0, 84, NULL, 41, '2026-09-27 17:32:01'),
(8424, 0, 0, 84, NULL, 41, '2026-09-27 17:32:02'),
(8425, 0, 0, 84, NULL, 41, '2026-09-27 17:32:04'),
(8426, 0, 0, 84, NULL, 42, '2026-09-27 17:32:05'),
(8427, 0, 0, 84, NULL, 42, '2026-09-27 17:32:07'),
(8428, 0, 0, 84, NULL, 41, '2026-09-27 17:32:08'),
(8429, 0, 0, 84, NULL, 41, '2026-09-27 17:32:10'),
(8430, 0, 0, 84, NULL, 41, '2026-09-27 17:32:11'),
(8431, 0, 0, 84, NULL, 41, '2026-09-27 17:32:13'),
(8432, 0, 0, 84, NULL, 41, '2026-09-27 17:32:14'),
(8433, 0, 0, 84, NULL, 41, '2026-09-27 17:32:16'),
(8434, 0, 0, 84, NULL, 41, '2026-09-27 17:32:17'),
(8435, 0, 0, 84, NULL, 41, '2026-09-27 17:32:19'),
(8436, 0, 0, 84, NULL, 41, '2026-09-27 17:32:20'),
(8437, 0, 0, 84, NULL, 41, '2026-09-27 17:32:25'),
(8438, 0, 0, 84, NULL, 41, '2026-09-27 17:32:25'),
(8439, 0, 0, 84, NULL, 41, '2026-09-27 17:32:26'),
(8440, 0, 0, 84, NULL, 41, '2026-09-27 17:32:28'),
(8441, 0, 0, 84, NULL, 42, '2026-09-27 17:32:29'),
(8442, 0, 0, 84, NULL, 42, '2026-09-27 17:32:32'),
(8443, 0, 0, 84, NULL, 41, '2026-09-27 17:32:33'),
(8444, 0, 0, 84, NULL, 41, '2026-09-27 17:32:37'),
(8445, 0, 0, 84, NULL, 41, '2026-09-27 17:32:37'),
(8446, 0, 0, 84, NULL, 41, '2026-09-27 17:32:38'),
(8447, 0, 0, 84, NULL, 41, '2026-09-27 17:32:40'),
(8448, 0, 0, 84, NULL, 41, '2026-09-27 17:32:41'),
(8449, 0, 0, 84, NULL, 41, '2026-09-27 17:32:43'),
(8450, 0, 0, 84, NULL, 41, '2026-09-27 17:32:44'),
(8451, 0, 0, 84, NULL, 41, '2026-09-27 17:32:46'),
(8452, 0, 0, 84, NULL, 41, '2026-09-27 17:32:48'),
(8453, 0, 0, 84, NULL, 41, '2026-09-27 17:32:49'),
(8454, 0, 0, 84, NULL, 41, '2026-09-27 17:32:51'),
(8455, 0, 0, 84, NULL, 41, '2026-09-27 17:32:52'),
(8456, 0, 0, 84, NULL, 41, '2026-09-27 17:32:54'),
(8457, 0, 0, 84, NULL, 41, '2026-09-27 17:32:56'),
(8458, 0, 0, 84, NULL, 42, '2026-09-27 17:32:57'),
(8459, 0, 0, 84, NULL, 42, '2026-09-27 17:32:59'),
(8460, 0, 0, 85, NULL, 41, '2026-09-27 17:33:00'),
(8461, 0, 0, 85, NULL, 41, '2026-09-27 17:33:01'),
(8462, 0, 0, 84, NULL, 42, '2026-09-27 17:33:03'),
(8463, 0, 0, 84, NULL, 42, '2026-09-27 17:33:05'),
(8464, 0, 0, 84, NULL, 40, '2026-09-27 17:33:06'),
(8465, 0, 0, 84, NULL, 40, '2026-09-27 17:33:08'),
(8466, 0, 0, 84, NULL, 42, '2026-09-27 17:33:12'),
(8467, 0, 0, 84, NULL, 42, '2026-09-27 17:33:13'),
(8468, 0, 0, 84, NULL, 42, '2026-09-27 17:33:14'),
(8469, 0, 0, 84, NULL, 42, '2026-09-27 17:33:15'),
(8470, 0, 0, 84, NULL, 42, '2026-09-27 17:33:17'),
(8471, 0, 0, 84, NULL, 42, '2026-09-27 17:33:18'),
(8472, 0, 0, 84, NULL, 42, '2026-09-27 17:33:20'),
(8473, 0, 0, 84, NULL, 41, '2026-09-27 17:33:21'),
(8474, 0, 0, 84, NULL, 41, '2026-09-27 17:33:23'),
(8475, 0, 0, 84, NULL, 41, '2026-09-27 17:33:24'),
(8476, 0, 0, 84, NULL, 41, '2026-09-27 17:33:29'),
(8477, 0, 0, 84, NULL, 41, '2026-09-27 17:33:29'),
(8478, 0, 0, 84, NULL, 41, '2026-09-27 17:33:30'),
(8479, 0, 0, 84, NULL, 41, '2026-09-27 17:33:32'),
(8480, 0, 0, 85, NULL, 41, '2026-09-27 17:33:33'),
(8481, 0, 0, 85, NULL, 41, '2026-09-27 17:33:35'),
(8482, 0, 0, 84, NULL, 41, '2026-09-27 17:33:36'),
(8483, 0, 0, 84, NULL, 41, '2026-09-27 17:33:38'),
(8484, 0, 0, 84, NULL, 41, '2026-09-27 17:33:39'),
(8485, 0, 0, 84, NULL, 41, '2026-09-27 17:33:41'),
(8486, 0, 0, 85, NULL, 42, '2026-09-27 17:33:42'),
(8487, 0, 0, 85, NULL, 42, '2026-09-27 17:33:44'),
(8488, 0, 0, 84, NULL, 41, '2026-09-27 17:33:45'),
(8489, 0, 0, 84, NULL, 41, '2026-09-27 17:33:47'),
(8490, 0, 0, 84, NULL, 41, '2026-09-27 17:33:48'),
(8491, 0, 0, 84, NULL, 41, '2026-09-27 17:33:50'),
(8492, 0, 0, 84, NULL, 44, '2026-09-27 17:33:51'),
(8493, 0, 0, 84, NULL, 44, '2026-09-27 17:33:53'),
(8494, 0, 0, 84, NULL, 42, '2026-09-27 17:33:54'),
(8495, 0, 0, 84, NULL, 42, '2026-09-27 17:33:56'),
(8496, 0, 0, 84, NULL, 41, '2026-09-27 17:33:57'),
(8497, 0, 0, 84, NULL, 41, '2026-09-27 17:33:59'),
(8498, 0, 0, 84, NULL, 41, '2026-09-27 17:34:00'),
(8499, 0, 0, 84, NULL, 41, '2026-09-27 17:34:02'),
(8500, 0, 0, 85, NULL, 41, '2026-09-27 17:34:03'),
(8501, 0, 0, 85, NULL, 41, '2026-09-27 17:34:05'),
(8502, 0, 0, 85, NULL, 41, '2026-09-27 17:34:06'),
(8503, 0, 0, 85, NULL, 41, '2026-09-27 17:34:08'),
(8504, 0, 0, 85, NULL, 42, '2026-09-27 17:34:09'),
(8505, 0, 0, 85, NULL, 42, '2026-09-27 17:34:11'),
(8506, 0, 0, 84, NULL, 42, '2026-09-27 17:34:12'),
(8507, 0, 0, 84, NULL, 42, '2026-09-27 17:34:14'),
(8508, 0, 0, 84, NULL, 42, '2026-09-27 17:34:15'),
(8509, 0, 0, 84, NULL, 42, '2026-09-27 17:34:17'),
(8510, 0, 0, 85, NULL, 42, '2026-09-27 17:34:18'),
(8511, 0, 0, 85, NULL, 42, '2026-09-27 17:34:20'),
(8512, 0, 0, 84, NULL, 42, '2026-09-27 17:34:21'),
(8513, 0, 0, 84, NULL, 42, '2026-09-27 17:34:23'),
(8514, 0, 0, 85, NULL, 42, '2026-09-27 17:34:24'),
(8515, 0, 0, 85, NULL, 42, '2026-09-27 17:34:26'),
(8516, 0, 0, 84, NULL, 42, '2026-09-27 17:34:27'),
(8517, 0, 0, 84, NULL, 42, '2026-09-27 17:34:29'),
(8518, 0, 0, 84, NULL, 42, '2026-09-27 17:34:30'),
(8519, 0, 0, 84, NULL, 42, '2026-09-27 17:34:32'),
(8520, 0, 0, 84, NULL, 41, '2026-09-27 17:34:33'),
(8521, 0, 0, 84, NULL, 41, '2026-09-27 17:34:35'),
(8522, 0, 0, 84, NULL, 42, '2026-09-27 17:34:36'),
(8523, 0, 0, 84, NULL, 42, '2026-09-27 17:34:38'),
(8524, 0, 0, 85, NULL, 42, '2026-09-27 17:34:39'),
(8525, 0, 0, 85, NULL, 42, '2026-09-27 17:34:41'),
(8526, 0, 0, 84, NULL, 42, '2026-09-27 17:34:42'),
(8527, 0, 0, 84, NULL, 42, '2026-09-27 17:34:44'),
(8528, 0, 0, 84, NULL, 42, '2026-09-27 17:34:45'),
(8529, 0, 0, 84, NULL, 42, '2026-09-27 17:34:47'),
(8530, 0, 0, 85, NULL, 42, '2026-09-27 17:34:48'),
(8531, 0, 0, 85, NULL, 42, '2026-09-27 17:34:50'),
(8532, 0, 0, 85, NULL, 42, '2026-09-27 17:34:51'),
(8533, 0, 0, 85, NULL, 42, '2026-09-27 17:34:53'),
(8534, 0, 0, 85, NULL, 42, '2026-09-27 17:34:54'),
(8535, 0, 0, 85, NULL, 42, '2026-09-27 17:34:56'),
(8536, 0, 0, 84, NULL, 42, '2026-09-27 17:34:57'),
(8537, 0, 0, 84, NULL, 42, '2026-09-27 17:34:59'),
(8538, 0, 0, 85, NULL, 42, '2026-09-27 17:35:00'),
(8539, 0, 0, 85, NULL, 42, '2026-09-27 17:35:02'),
(8540, 0, 0, 84, NULL, 42, '2026-09-27 17:35:03'),
(8541, 0, 0, 84, NULL, 42, '2026-09-27 17:35:05'),
(8542, 0, 0, 84, NULL, 43, '2026-09-27 17:35:07'),
(8543, 0, 0, 84, NULL, 43, '2026-09-27 17:35:08'),
(8544, 0, 0, 84, NULL, 42, '2026-09-27 17:35:10'),
(8545, 0, 0, 84, NULL, 42, '2026-09-27 17:35:11'),
(8546, 0, 0, 84, NULL, 42, '2026-09-27 17:35:13'),
(8547, 0, 0, 84, NULL, 42, '2026-09-27 17:35:14'),
(8548, 0, 0, 85, NULL, 42, '2026-09-27 17:35:18'),
(8549, 0, 0, 85, NULL, 41, '2026-09-27 17:36:28'),
(8550, 0, 0, 0, NULL, 46, '2026-09-27 18:09:57');

-- --------------------------------------------------------

--
-- Table structure for table `system_status`
--

CREATE TABLE `system_status` (
  `id` int(11) NOT NULL,
  `arduino_status` varchar(20) NOT NULL DEFAULT 'disconnected',
  `esp8266_status` varchar(20) NOT NULL DEFAULT 'disconnected',
  `wifi_status` varchar(20) NOT NULL DEFAULT 'disconnected',
  `backend_status` varchar(20) NOT NULL DEFAULT 'online',
  `database_status` varchar(20) NOT NULL DEFAULT 'disconnected',
  `esp8266_ip` varchar(45) DEFAULT NULL,
  `wifi_signal` int(11) DEFAULT NULL,
  `last_sensor_update` timestamp NULL DEFAULT NULL,
  `last_actuator_update` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_status`
--

INSERT INTO `system_status` (`id`, `arduino_status`, `esp8266_status`, `wifi_status`, `backend_status`, `database_status`, `esp8266_ip`, `wifi_signal`, `last_sensor_update`, `last_actuator_update`, `updated_at`) VALUES
(1, 'connected', 'online', 'connected', 'online', 'connected', '192.168.68.108', -67, '2026-09-27 18:09:57', '2026-09-27 18:09:59', '2026-09-27 18:09:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actuator_current_status`
--
ALTER TABLE `actuator_current_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_device` (`device`);

--
-- Indexes for table `actuator_logs`
--
ALTER TABLE `actuator_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_device` (`device`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `automation_settings`
--
ALTER TABLE `automation_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sensor_readings`
--
ALTER TABLE `sensor_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `system_status`
--
ALTER TABLE `system_status`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `actuator_current_status`
--
ALTER TABLE `actuator_current_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12386;

--
-- AUTO_INCREMENT for table `actuator_logs`
--
ALTER TABLE `actuator_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=374;

--
-- AUTO_INCREMENT for table `automation_settings`
--
ALTER TABLE `automation_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sensor_readings`
--
ALTER TABLE `sensor_readings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8551;

--
-- AUTO_INCREMENT for table `system_status`
--
ALTER TABLE `system_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
