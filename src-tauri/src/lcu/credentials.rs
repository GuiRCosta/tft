use base64::Engine as _;
use base64::engine::general_purpose::STANDARD;
use sysinfo::System;

use super::error::LcuError;
use super::lockfile;

#[derive(Debug, Clone)]
pub struct LcuCredentials {
    pub port: u16,
    pub auth_token: String,
    pub auth_header: String,
}

fn build_credentials(port: u16, password: String) -> LcuCredentials {
    let encoded = STANDARD.encode(format!("riot:{}", password));
    LcuCredentials {
        port,
        auth_token: password,
        auth_header: format!("Basic {}", encoded),
    }
}

fn get_credentials_from_process() -> Result<LcuCredentials, LcuError> {
    let mut system = System::new();
    system.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    for (_, process) in system.processes() {
        let name = process.name().to_string_lossy().to_string();
        if name.contains("LeagueClientUx") {
            let cmd: Vec<String> = process.cmd().iter().map(|s| s.to_string_lossy().to_string()).collect();
            let cmd_str = cmd.join(" ");

            let port = extract_arg(&cmd_str, "--app-port=")
                .and_then(|v| v.parse::<u16>().ok())
                .ok_or(LcuError::ProcessNotFound)?;

            let token = extract_arg(&cmd_str, "--remoting-auth-token=")
                .ok_or(LcuError::ProcessNotFound)?;

            return Ok(build_credentials(port, token));
        }
    }

    Err(LcuError::ProcessNotFound)
}

fn extract_arg(cmd: &str, prefix: &str) -> Option<String> {
    cmd.find(prefix).map(|start| {
        let value_start = start + prefix.len();
        let rest = &cmd[value_start..];
        let end = rest.find(' ').unwrap_or(rest.len());
        rest[..end].to_string()
    })
}

pub fn get_credentials() -> Result<LcuCredentials, LcuError> {
    match lockfile::read_lockfile() {
        Ok(data) => Ok(build_credentials(data.port, data.password)),
        Err(_) => get_credentials_from_process(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_credentials() {
        let creds = build_credentials(57732, "abc123".to_string());
        assert_eq!(creds.port, 57732);
        assert_eq!(creds.auth_token, "abc123");
        assert!(creds.auth_header.starts_with("Basic "));
    }

    #[test]
    fn test_extract_arg() {
        let cmd = "--app-port=57732 --remoting-auth-token=abc123 --other=flag";
        assert_eq!(extract_arg(cmd, "--app-port="), Some("57732".to_string()));
        assert_eq!(
            extract_arg(cmd, "--remoting-auth-token="),
            Some("abc123".to_string())
        );
        assert_eq!(extract_arg(cmd, "--nonexistent="), None);
    }
}
