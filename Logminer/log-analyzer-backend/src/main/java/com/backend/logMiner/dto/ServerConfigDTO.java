package com.backend.logMiner.dto;

public class ServerConfigDTO {
    private final  Integer idServerConfig;
    private final  String name;
    private final  String ipAddress;
    private final  String protocol;
    private final  Integer port;

    public ServerConfigDTO(Integer idServerConfig,
                           String name,
                           String ipAddress,
                           String protocol,
                           Integer port) {
        this.idServerConfig = idServerConfig;
        this.name = name;
        this.ipAddress = ipAddress;
        this.protocol = protocol;
        this.port = port;
    }

    public Integer getIdServerConfig() {
        return idServerConfig;
    }

    public String getName() {
        return name;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getProtocol() {
        return protocol;
    }

    public Integer getPort() {
        return port;
    }
}
