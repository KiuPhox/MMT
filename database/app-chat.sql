-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 30, 2022 at 02:47 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `app-chat`
--

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_send` int(11) NOT NULL,
  `user_recieved` int(11) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `friends`
--

INSERT INTO `friends` (`id`, `user_send`, `user_recieved`, `status`) VALUES
(71, 6, 7, 1),
(72, 6, 8, 1),
(73, 8, 7, 1),
(74, 6, 9, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `socket_id` varchar(500) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(200) NOT NULL,
  `phone` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `socket_id`, `name`, `password`, `phone`) VALUES
(6, 'zWTf7g_SZxXwuCbUAAAR', 'Anh Tuan', '$2a$08$gkbMgg.Y1/tpNAKrBJPOX.wy5ZNb8IgI5ZaJSaVFHV8k7J427iiPm', '0941974458'),
(7, 'pYJ9GyCfsHhhK4qNAAAT', 'b', '$2a$08$2zTKDVILrL4slJ7L2n.w9eh6Y5.F6jmSmVkSQj8nQQf29DYDtNrp6', '012345678'),
(8, 'yPaKxvsgQ7XmJdbCAAAV', 'Hoang', '$2a$08$ITp9qJjTpS7VmA8OIU6Oyu5KPJZPmT5dz2IxHbyQvvZqPDWkVywRm', '987654321'),
(9, 'DplorM9dRwMaRboMAAAX', 'Tot', '$2a$08$lzhjXrRNKU8xVZOcGptoT.DDzIT9P1mTXmHCaseyWd3wbFvvgoBOu', '123123123');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_send` (`user_send`),
  ADD KEY `user_recieved` (`user_recieved`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
