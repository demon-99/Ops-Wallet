package com.nikhil.activity_service.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "user_activities")
public class UserActivity {

    @Id
    private String activityId;

    @Field("userId")
    @Indexed
    private String userId;

    @Field("activityType")
    @Indexed
    private String activityType;

    @Field("description")
    private String description;

    @Field("metadata")
    private Map<String, Object> metadata;

    @Field("ipAddress")
    private String ipAddress;

    @Field("userAgent")
    private String userAgent;

    @Field("sessionId")
    private String sessionId;

    @Field("createdAt")
    @Indexed
    private Date createdAt = new Date();

    @Override
    public String toString() {
        return "UserActivity{" +
                "activityId='" + activityId + '\'' +
                ", userId='" + userId + '\'' +
                ", activityType='" + activityType + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
