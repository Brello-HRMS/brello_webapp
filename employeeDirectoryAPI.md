## LIST Employees

curl --location 'http://localhost:8000/api/v1/employees?page=1&limit=10&sort_by=created_at&sort_order=DESC' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTc1YTlkOC05YjM5LTQ4OWMtYjk3Ni0xOTlmYTBhZjgzNmUiLCJzZXNzaW9uSWQiOiI2YjY1YjE1MC1lOGM3LTQxNWItYTlkMi05ZTQwOGRiNjliNTMiLCJvcmdhbml6YXRpb25JZCI6ImRjNDBmZWE4LWZiMzgtNDlhNi1hNWRhLWFiNmViODE3YWQ1OCIsImVudGVycHJpc2VJZCI6IjhkNzQzMGFmLWZhYjMtNDQwNC05M2I2LWZlMDdlODkwNzI1MyIsImFwcElkIjoiMDM0NGY2MjUtYTNhZi00MmQyLTg1YmEtZDAzOGMzNzA3N2Q4IiwiaXNQbGF0Zm9ybUFkbWluIjpmYWxzZSwiaWF0IjoxNzc1MzI3NjMxLCJleHAiOjE3NzU0MTQwMzF9.CbhWTNzSJ-v1Pebz36CSKrQ-FdYWLRAHLgweBSJjD08'

### Response:
{
    "success": true,
    "data": {
        "data": [
            {
                "id": "3dfabb31-f1b1-48cf-8d89-fd3c29974c43",
                "firstName": "Viraj",
                "lastName": "Khan",
                "email": "viraj@gmail.com",
                "status": "PENDING",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "8763c1e3-3355-48b5-8fe1-d727c8b7f536",
                "firstName": "Parul",
                "lastName": "Singh",
                "email": "parul@gmail.com",
                "status": "PENDING",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "048c1c7e-7818-41d3-b87b-202006cfcd0c",
                "firstName": "Mohd",
                "lastName": "Sonam",
                "email": "sonam@gmail.com",
                "status": "PENDING",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "bbe07060-9146-4963-a439-cef3364ca415",
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe11@example.com",
                "status": "PENDING",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "b19c3b7d-c82c-409a-a02d-7f7403eefc50",
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe1@example.com",
                "status": "PENDING",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "52e2a396-17b8-4aba-a836-d47d0cbcf86d",
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe@example.com",
                "status": "PENDING",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "0717b6cb-58b8-45da-9404-f7478e6fb18e",
                "firstName": "BB",
                "lastName": "MM",
                "email": "bb.mm@example.com",
                "status": "ACTIVE",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "cec2194b-9d49-4f46-9ad9-70af7303792f",
                "firstName": "Jane",
                "lastName": "Smith",
                "email": "khanzaid@gmail.com",
                "status": "ACTIVE",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "ab29abf0-b40f-4abc-a0f6-d5b27439dda8",
                "firstName": "Jane",
                "lastName": "Smith",
                "email": "jane.smith@example.com",
                "status": "ACTIVE",
                "avatar": null,
                "memberAvatars": []
            },
            {
                "id": "1175a9d8-9b39-489c-b976-199fa0af836e",
                "firstName": "Admin",
                "lastName": "Test",
                "email": "b10@admin.com",
                "status": "ACTIVE",
                "avatar": null,
                "memberAvatars": []
            }
        ],
        "meta": {
            "total": 10,
            "page": 1,
            "limit": 10,
            "totalPages": 1
        }
    },
    "timestamp": "2026-04-05T11:04:31.140Z"
}

