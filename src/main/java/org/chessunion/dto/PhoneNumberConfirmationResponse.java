package org.chessunion.dto;

/*
{
	"response":{
		"msg":{
			"err_code":"0",
			"text":"OK",
			"type":"message"
			},
			"data":{
				"id":21528183,
				"credits":1.78,
				"n_raw_sms":1,
				"sender_name":"MyBrandName"
			}
		}
   }

 */

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PhoneNumberConfirmationResponse {
    @JsonProperty("response")
    private Response response;

    @Data
    public static class Response {
        @JsonProperty("msg")
        private Message msg;

        @JsonProperty("data")
        private ResponseData data;
    }

    @Data
    public static class Message {
        @JsonProperty("err_code")
        private String errorCode;

        @JsonProperty("text")
        private String text;

        @JsonProperty("type")
        private String type;
    }

    @Data
    public static class ResponseData {
        @JsonProperty("id")
        private Long id;

        @JsonProperty("credits")
        private Double credits;

        @JsonProperty("n_raw_sms")
        private Integer rawSmsCount;

        @JsonProperty("sender_name")
        private String senderName;
    }
}
