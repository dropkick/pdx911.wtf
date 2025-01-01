SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET NAMES utf8mb4 */;
-- --------------------------------------------------------
--
-- Table structure for table `911_calls`
--

CREATE TABLE `911_calls` (
  `call_id` varchar(20) NOT NULL,
  `agency` varchar(100) NOT NULL,
  `call_category` varchar(200) NOT NULL,
  `call_text_address` varchar(200) NOT NULL,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  `call_updated` varchar(28) NOT NULL,
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Indexes for table `911_calls`
--
ALTER TABLE `911_calls`
  ADD PRIMARY KEY (`call_id`),
  ADD UNIQUE KEY `call_id` (`call_id`);
COMMIT;

