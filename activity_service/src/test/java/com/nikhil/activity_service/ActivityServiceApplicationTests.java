package com.nikhil.activity_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
		"spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration," +
				"org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration," +
				"org.springframework.boot.autoconfigure.data.mongo.MongoRepositoriesAutoConfiguration"
})
class ActivityServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
