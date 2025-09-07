package com.backend.logMiner.repository;

import com.backend.logMiner.model.ParsingResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParsingResultRepository extends JpaRepository<ParsingResult, Integer> {}