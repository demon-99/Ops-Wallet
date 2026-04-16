package com.nikhil.user_service.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String userId;  // MongoDB generates ObjectId automatically

    @Field("email")
    @Indexed(unique = true)
    private String email;

    @Field("passwordHash")
    private String passwordHash;

    @Field("firstName")
    private String firstName;

    @Field("lastName")
    private String lastName;

    @Field("lastLogin")
    private Date lastLogin;

    @Field("createdAt")
    private Date createdAt = new Date();

    @Field("updatedAt")
    private Date updatedAt = new Date();

    @Override
    public String toString() {
        return "User{" +
                ", createdAt=" + createdAt +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastLogin=" + lastLogin +
                ", lastName='" + lastName + '\'' +
                ", updatedAt=" + updatedAt +
                ", userId='" + userId + '\'' +
                '}';
    }
}
